const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, profile_image, language, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const tripCount = db.prepare('SELECT COUNT(*) as count FROM trips WHERE user_id = ?').get(req.user.id).count;
    const favorites = db.prepare('SELECT c.* FROM favorites f JOIN cities c ON f.city_id = c.id WHERE f.user_id = ?').all(req.user.id);

    res.json({ user, tripCount, favorites });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile
router.put('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { name, email, language, profile_image } = req.body;

    if (email && email !== req.user.email) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    db.prepare('UPDATE users SET name = ?, email = ?, language = ?, profile_image = ? WHERE id = ?')
      .run(
        name ?? req.user.name,
        email ?? req.user.email,
        language ?? 'en',
        profile_image ?? null,
        req.user.id
      );

    const user = db.prepare('SELECT id, name, email, profile_image, language, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profile/password
router.put('/password', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Current and new password are required' });
    if (new_password.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/profile
router.delete('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    // Delete user's data
    db.prepare('DELETE FROM favorites WHERE user_id = ?').run(req.user.id);
    db.prepare('DELETE FROM trip_activities WHERE trip_stop_id IN (SELECT id FROM trip_stops WHERE trip_id IN (SELECT id FROM trips WHERE user_id = ?))').run(req.user.id);
    db.prepare('DELETE FROM expenses WHERE trip_id IN (SELECT id FROM trips WHERE user_id = ?)').run(req.user.id);
    db.prepare('DELETE FROM trip_stops WHERE trip_id IN (SELECT id FROM trips WHERE user_id = ?)').run(req.user.id);
    db.prepare('DELETE FROM trips WHERE user_id = ?').run(req.user.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
