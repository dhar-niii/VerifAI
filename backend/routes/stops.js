const express = require('express');
const { getDb } = require('../database/init');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Helper: verify trip ownership
function verifyTripOwnership(db, tripId, userId) {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  if (!trip) return { error: 'Trip not found', status: 404 };
  if (trip.user_id !== userId) return { error: 'Access denied', status: 403 };
  return { trip };
}

// POST /api/trips/:tripId/stops — add a stop
router.post('/trips/:tripId/stops', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const check = verifyTripOwnership(db, req.params.tripId, req.user.id);
    if (check.error) return res.status(check.status).json({ error: check.error });

    const { city_id, arrival_date, departure_date, transportation, accommodation, notes } = req.body;
    if (!city_id) return res.status(400).json({ error: 'City is required' });

    const maxOrder = db.prepare('SELECT MAX(order_index) as max_idx FROM trip_stops WHERE trip_id = ?').get(req.params.tripId);
    const orderIndex = (maxOrder.max_idx ?? -1) + 1;

    const result = db.prepare(
      'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, transportation, accommodation, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.params.tripId, city_id, arrival_date || null, departure_date || null, orderIndex, transportation || '', accommodation || '', notes || '');

    const stop = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image
      FROM trip_stops ts JOIN cities c ON ts.city_id = c.id WHERE ts.id = ?
    `).get(result.lastInsertRowid);

    stop.activities = [];
    res.status(201).json({ stop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/stops/:id — update a stop
router.put('/stops/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const stop = db.prepare('SELECT ts.*, t.user_id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE ts.id = ?').get(req.params.id);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    if (stop.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { city_id, arrival_date, departure_date, transportation, accommodation, notes, order_index } = req.body;
    db.prepare(`
      UPDATE trip_stops SET city_id = ?, arrival_date = ?, departure_date = ?, transportation = ?, accommodation = ?, notes = ?, order_index = ?
      WHERE id = ?
    `).run(
      city_id ?? stop.city_id,
      arrival_date ?? stop.arrival_date,
      departure_date ?? stop.departure_date,
      transportation ?? stop.transportation,
      accommodation ?? stop.accommodation,
      notes ?? stop.notes,
      order_index ?? stop.order_index,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT ts.*, c.name as city_name, c.country as city_country, c.image as city_image
      FROM trip_stops ts JOIN cities c ON ts.city_id = c.id WHERE ts.id = ?
    `).get(req.params.id);
    updated.activities = db.prepare('SELECT * FROM trip_activities WHERE trip_stop_id = ? ORDER BY date, start_time').all(req.params.id);

    res.json({ stop: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/stops/:id
router.delete('/stops/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const stop = db.prepare('SELECT ts.*, t.user_id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE ts.id = ?').get(req.params.id);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    if (stop.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    db.prepare('DELETE FROM trip_activities WHERE trip_stop_id = ?').run(req.params.id);
    db.prepare('DELETE FROM trip_stops WHERE id = ?').run(req.params.id);

    res.json({ message: 'Stop deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/stops/reorder — reorder stops
router.put('/stops/reorder', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { tripId, stopIds } = req.body;
    if (!tripId || !stopIds) return res.status(400).json({ error: 'tripId and stopIds are required' });

    const check = verifyTripOwnership(db, tripId, req.user.id);
    if (check.error) return res.status(check.status).json({ error: check.error });

    const update = db.prepare('UPDATE trip_stops SET order_index = ? WHERE id = ? AND trip_id = ?');
    const transaction = db.transaction(() => {
      stopIds.forEach((id, index) => update.run(index, id, tripId));
    });
    transaction();

    res.json({ message: 'Stops reordered' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/stops/:stopId/activities — add activity to stop
router.post('/stops/:stopId/activities', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const stop = db.prepare('SELECT ts.*, t.user_id FROM trip_stops ts JOIN trips t ON ts.trip_id = t.id WHERE ts.id = ?').get(req.params.stopId);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });
    if (stop.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { activity_id, name, description, date, start_time, end_time, notes, estimated_cost, category } = req.body;

    let activityName = name;
    let activityCategory = category || 'sightseeing';
    let activityCost = estimated_cost || 0;
    let activityDesc = description || '';

    if (activity_id) {
      const act = db.prepare('SELECT * FROM activities WHERE id = ?').get(activity_id);
      if (act) {
        activityName = activityName || act.name;
        activityCategory = activityCategory || act.category;
        activityCost = activityCost || act.estimated_cost;
        activityDesc = activityDesc || act.description;
      }
    }

    if (!activityName) return res.status(400).json({ error: 'Activity name is required' });

    const result = db.prepare(
      'INSERT INTO trip_activities (trip_stop_id, activity_id, name, description, date, start_time, end_time, notes, estimated_cost, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.params.stopId, activity_id || null, activityName, activityDesc, date || stop.arrival_date, start_time || '09:00', end_time || '', notes || '', activityCost, activityCategory);

    const ta = db.prepare('SELECT * FROM trip_activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ activity: ta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/trip-activities/:id — update trip activity
router.put('/trip-activities/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const ta = db.prepare(`
      SELECT ta.*, ts.trip_id, t.user_id
      FROM trip_activities ta
      JOIN trip_stops ts ON ta.trip_stop_id = ts.id
      JOIN trips t ON ts.trip_id = t.id
      WHERE ta.id = ?
    `).get(req.params.id);
    if (!ta) return res.status(404).json({ error: 'Activity not found' });
    if (ta.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { name, description, date, start_time, end_time, notes, estimated_cost, category } = req.body;
    db.prepare(`
      UPDATE trip_activities SET name = ?, description = ?, date = ?, start_time = ?, end_time = ?, notes = ?, estimated_cost = ?, category = ?
      WHERE id = ?
    `).run(
      name ?? ta.name, description ?? ta.description, date ?? ta.date,
      start_time ?? ta.start_time, end_time ?? ta.end_time, notes ?? ta.notes,
      estimated_cost ?? ta.estimated_cost, category ?? ta.category, req.params.id
    );

    const updated = db.prepare('SELECT * FROM trip_activities WHERE id = ?').get(req.params.id);
    res.json({ activity: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trip-activities/:id
router.delete('/trip-activities/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const ta = db.prepare(`
      SELECT ta.*, t.user_id FROM trip_activities ta
      JOIN trip_stops ts ON ta.trip_stop_id = ts.id
      JOIN trips t ON ts.trip_id = t.id
      WHERE ta.id = ?
    `).get(req.params.id);
    if (!ta) return res.status(404).json({ error: 'Activity not found' });
    if (ta.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    db.prepare('DELETE FROM trip_activities WHERE id = ?').run(req.params.id);
    res.json({ message: 'Activity removed' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
