const express = require('express');
const { getDb } = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/trips/:tripId/expenses
router.get('/trips/:tripId/expenses', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const expenses = db.prepare(`
      SELECT e.*, c.name as city_name
      FROM expenses e LEFT JOIN cities c ON e.city_id = c.id
      WHERE e.trip_id = ? ORDER BY e.date
    `).all(req.params.tripId);

    // Calculate breakdowns
    const byCategory = {};
    const byCity = {};
    let total = 0;
    for (const e of expenses) {
      total += e.amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      if (e.city_name) byCity[e.city_name] = (byCity[e.city_name] || 0) + e.amount;
    }

    const days = trip.start_date && trip.end_date
      ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + 1
      : 1;
    const avgDaily = total / days;

    res.json({
      expenses,
      summary: {
        total,
        budget: trip.budget,
        remaining: trip.budget - total,
        avg_daily: Math.round(avgDaily * 100) / 100,
        by_category: byCategory,
        by_city: byCity,
        days
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trips/:tripId/expenses
router.post('/trips/:tripId/expenses', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { category, amount, description, date, city_id } = req.body;
    if (!category || amount === undefined) return res.status(400).json({ error: 'Category and amount are required' });

    const result = db.prepare(
      'INSERT INTO expenses (trip_id, category, amount, description, date, city_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.params.tripId, category, amount, description || '', date || null, city_id || null);

    const expense = db.prepare('SELECT e.*, c.name as city_name FROM expenses e LEFT JOIN cities c ON e.city_id = c.id WHERE e.id = ?').get(result.lastInsertRowid);
    res.status(201).json({ expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/expenses/:id
router.put('/expenses/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const expense = db.prepare(`
      SELECT e.*, t.user_id FROM expenses e JOIN trips t ON e.trip_id = t.id WHERE e.id = ?
    `).get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (expense.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { category, amount, description, date, city_id } = req.body;
    db.prepare('UPDATE expenses SET category = ?, amount = ?, description = ?, date = ?, city_id = ? WHERE id = ?')
      .run(category ?? expense.category, amount ?? expense.amount, description ?? expense.description, date ?? expense.date, city_id ?? expense.city_id, req.params.id);

    const updated = db.prepare('SELECT e.*, c.name as city_name FROM expenses e LEFT JOIN cities c ON e.city_id = c.id WHERE e.id = ?').get(req.params.id);
    res.json({ expense: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses/:id
router.delete('/expenses/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const expense = db.prepare(`
      SELECT e.*, t.user_id FROM expenses e JOIN trips t ON e.trip_id = t.id WHERE e.id = ?
    `).get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (expense.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
