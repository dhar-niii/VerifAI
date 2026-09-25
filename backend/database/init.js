const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'globetrotter.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_image TEXT DEFAULT NULL,
      language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT,
      popularity INTEGER DEFAULT 50,
      cost_level TEXT DEFAULT 'medium',
      image TEXT,
      latitude REAL,
      longitude REAL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'sightseeing',
      duration TEXT,
      estimated_cost REAL DEFAULT 0,
      image TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      cover_image TEXT,
      budget REAL DEFAULT 0,
      visibility TEXT DEFAULT 'private',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS trip_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      arrival_date TEXT,
      departure_date TEXT,
      order_index INTEGER DEFAULT 0,
      transportation TEXT,
      accommodation TEXT,
      notes TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS trip_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_stop_id INTEGER NOT NULL,
      activity_id INTEGER,
      name TEXT,
      description TEXT,
      date TEXT,
      start_time TEXT,
      end_time TEXT,
      notes TEXT,
      estimated_cost REAL DEFAULT 0,
      category TEXT DEFAULT 'sightseeing',
      FOREIGN KEY (trip_stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      amount REAL DEFAULT 0,
      description TEXT,
      date TEXT,
      city_id INTEGER,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (city_id) REFERENCES cities(id),
      UNIQUE(user_id, city_id)
    );

    CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON trip_stops(trip_id);
    CREATE INDEX IF NOT EXISTS idx_trip_activities_stop ON trip_activities(trip_stop_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
    CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
  `);
}

module.exports = { getDb };
