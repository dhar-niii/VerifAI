const express = require('express');
const { getDb } = require('../database/init');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/trips — list user's trips
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const trips = db.prepare(`
      SELECT t.*,
        (SELECT COUNT(*) FROM trip_stops ts WHERE ts.trip_id = t.id) as stop_count,
        (SELECT COALESCE(SUM(e.amount), 0) FROM expenses e WHERE e.trip_id = t.id) as total_spent
      FROM trips t WHERE t.user_id = ? ORDER BY t.start_date DESC
    `).all(req.user.id);
    res.json({ trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trips — create trip
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, start_date, end_date, budget, cover_image } = req.body;
    if (!name) return res.status(400).json({ error: 'Trip name is required' });
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO trips (user_id, name, description, start_date, end_date, budget, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, name, description || '', start_date || null, end_date || null, budget || 0, cover_image || null);
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trips/:id — get single trip with stops and activities
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Check ownership for private trips
    if (trip.visibility === 'private' && (!req.user || req.user.id !== trip.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image, c.region as city_region
      FROM trip_stops ts
      JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ?
      ORDER BY ts.order_index
    `).all(req.params.id);

    for (const stop of stops) {
      stop.activities = db.prepare(`
        SELECT ta.*, a.name as activity_name, a.category as activity_category, a.image as activity_image
        FROM trip_activities ta
        LEFT JOIN activities a ON ta.activity_id = a.id
        WHERE ta.trip_stop_id = ?
        ORDER BY ta.date, ta.start_time
      `).all(stop.id);
    }

    const expenses = db.prepare(`
      SELECT e.*, c.name as city_name
      FROM expenses e
      LEFT JOIN cities c ON e.city_id = c.id
      WHERE e.trip_id = ?
      ORDER BY e.date
    `).all(req.params.id);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // User info for owner
    const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(trip.user_id);

    res.json({ trip, stops, expenses, totalSpent, owner: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/trips/:id — update trip
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { name, description, start_date, end_date, budget, cover_image, visibility } = req.body;
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    db.prepare(`
      UPDATE trips SET name = ?, description = ?, start_date = ?, end_date = ?, budget = ?, cover_image = ?, visibility = ?
      WHERE id = ?
    `).run(
      name ?? trip.name,
      description ?? trip.description,
      start_date ?? trip.start_date,
      end_date ?? trip.end_date,
      budget ?? trip.budget,
      cover_image ?? trip.cover_image,
      visibility ?? trip.visibility,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    res.json({ trip: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    db.prepare('DELETE FROM trip_activities WHERE trip_stop_id IN (SELECT id FROM trip_stops WHERE trip_id = ?)').run(req.params.id);
    db.prepare('DELETE FROM trip_stops WHERE trip_id = ?').run(req.params.id);
    db.prepare('DELETE FROM expenses WHERE trip_id = ?').run(req.params.id);
    db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);

    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/trips/:id — public shared itinerary
router.get('/public/:id', (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND visibility = ?').get(req.params.id, 'public');
    if (!trip) return res.status(404).json({ error: 'Trip not found or not public' });

    const stops = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image
      FROM trip_stops ts JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ? ORDER BY ts.order_index
    `).all(req.params.id);

    for (const stop of stops) {
      stop.activities = db.prepare(`
        SELECT ta.* FROM trip_activities ta WHERE ta.trip_stop_id = ? ORDER BY ta.date, ta.start_time
      `).all(stop.id);
    }

    const expenses = db.prepare('SELECT category, SUM(amount) as total FROM expenses WHERE trip_id = ? GROUP BY category').all(req.params.id);
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(trip.user_id);

    res.json({ trip, stops, expenses, owner: user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
