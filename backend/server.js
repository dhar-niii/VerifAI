require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
getDb();
console.log('📦 Database initialized');

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api', require('./routes/stops'));
app.use('/api/cities', require('./routes/cities'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api', require('./routes/expenses'));
app.use('/api/profile', require('./routes/profile'));

// Public trip route
app.get('/api/public/trips/:id', (req, res) => {
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
      stop.activities = db.prepare('SELECT * FROM trip_activities WHERE trip_stop_id = ? ORDER BY date, start_time').all(stop.id);
    }

    const expenses = db.prepare('SELECT category, SUM(amount) as total FROM expenses WHERE trip_id = ? GROUP BY category').all(req.params.id);
    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(trip.user_id);

    res.json({ trip, stops, expenses, owner: user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌍 GlobeTrotter API running on http://localhost:${PORT}`);
});
