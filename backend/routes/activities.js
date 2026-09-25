const express = require('express');
const { getDb } = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/activities — list activities with filters
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, category, city_id, min_cost, max_cost } = req.query;
    let query = `
      SELECT a.*, c.name as city_name, c.country as city_country
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (a.name LIKE ? OR a.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND a.category = ?';
      params.push(category);
    }
    if (city_id) {
      query += ' AND a.city_id = ?';
      params.push(city_id);
    }
    if (min_cost) {
      query += ' AND a.estimated_cost >= ?';
      params.push(Number(min_cost));
    }
    if (max_cost) {
      query += ' AND a.estimated_cost <= ?';
      params.push(Number(max_cost));
    }

    query += ' ORDER BY a.name';
    const activities = db.prepare(query).all(...params);
    res.json({ activities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/search
router.get('/search', (req, res) => {
  try {
    const db = getDb();
    const { q, category } = req.query;
    if (!q && !category) return res.json({ activities: [] });

    let query = `
      SELECT a.*, c.name as city_name, c.country as city_country
      FROM activities a
      JOIN cities c ON a.city_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (q) {
      query += ' AND (a.name LIKE ? OR a.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) {
      query += ' AND a.category = ?';
      params.push(category);
    }
    query += ' ORDER BY a.name';

    const activities = db.prepare(query).all(...params);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/categories
router.get('/categories', (req, res) => {
  try {
    const db = getDb();
    const categories = db.prepare('SELECT DISTINCT category, COUNT(*) as count FROM activities GROUP BY category ORDER BY count DESC').all();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/activities/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const activity = db.prepare(`
      SELECT a.*, c.name as city_name, c.country as city_country
      FROM activities a JOIN cities c ON a.city_id = c.id WHERE a.id = ?
    `).get(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json({ activity });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
