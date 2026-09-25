const express = require('express');
const { getDb } = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/cities — list all cities with optional search
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, country, region, sort } = req.query;
    let query = 'SELECT * FROM cities WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR country LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (country) {
      query += ' AND country = ?';
      params.push(country);
    }
    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }

    if (sort === 'popularity') query += ' ORDER BY popularity DESC';
    else if (sort === 'cost_low') query += ' ORDER BY cost_level';
    else query += ' ORDER BY name';

    const cities = db.prepare(query).all(...params);

    // Get activity count for each city
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM activities WHERE city_id = ?');
    for (const city of cities) {
      city.activity_count = countStmt.get(city.id).count;
    }

    res.json({ cities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cities/search
router.get('/search', (req, res) => {
  try {
    const db = getDb();
    const { q } = req.query;
    if (!q) return res.json({ cities: [] });

    const cities = db.prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM activities a WHERE a.city_id = c.id) as activity_count
      FROM cities c
      WHERE c.name LIKE ? OR c.country LIKE ? OR c.region LIKE ?
      ORDER BY c.popularity DESC
    `).all(`%${q}%`, `%${q}%`, `%${q}%`);

    res.json({ cities });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cities/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
    if (!city) return res.status(404).json({ error: 'City not found' });

    const activities = db.prepare('SELECT * FROM activities WHERE city_id = ? ORDER BY category, name').all(req.params.id);
    res.json({ city, activities });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cities/meta/regions — get unique regions for filtering
router.get('/meta/regions', (req, res) => {
  try {
    const db = getDb();
    const regions = db.prepare('SELECT DISTINCT region FROM cities WHERE region IS NOT NULL ORDER BY region').all();
    const countries = db.prepare('SELECT DISTINCT country FROM cities ORDER BY country').all();
    res.json({ regions: regions.map(r => r.region), countries: countries.map(c => c.country) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Favorites
router.post('/:id/favorite', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND city_id = ?').get(req.user.id, req.params.id);
    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      res.json({ favorited: false });
    } else {
      db.prepare('INSERT INTO favorites (user_id, city_id) VALUES (?, ?)').run(req.user.id, req.params.id);
      res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/favorites', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const favorites = db.prepare(`
      SELECT c.*, f.created_at as favorited_at
      FROM favorites f JOIN cities c ON f.city_id = c.id
      WHERE f.user_id = ?
    `).all(req.user.id);
    res.json({ favorites });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
