require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getDb } = require('./init');
const bcrypt = require('bcryptjs');

const db = getDb();

// Clear existing data
db.exec(`
  DELETE FROM favorites;
  DELETE FROM trip_activities;
  DELETE FROM expenses;
  DELETE FROM trip_stops;
  DELETE FROM trips;
  DELETE FROM activities;
  DELETE FROM cities;
  DELETE FROM users;
`);

// --- Cities ---
const cities = [
  { name: 'Paris', country: 'France', region: 'Western Europe', popularity: 95, cost_level: 'high', image: '/images/paris.jpg', latitude: 48.8566, longitude: 2.3522, description: 'The City of Light, known for the Eiffel Tower, art, and cuisine.' },
  { name: 'London', country: 'United Kingdom', region: 'Western Europe', popularity: 93, cost_level: 'high', image: '/images/london.jpg', latitude: 51.5074, longitude: -0.1278, description: 'Historic capital with royal palaces, museums, and vibrant culture.' },
  { name: 'Rome', country: 'Italy', region: 'Southern Europe', popularity: 92, cost_level: 'medium', image: '/images/rome.jpg', latitude: 41.9028, longitude: 12.4964, description: 'The Eternal City with ancient ruins and incredible food.' },
  { name: 'Tokyo', country: 'Japan', region: 'East Asia', popularity: 91, cost_level: 'high', image: '/images/tokyo.jpg', latitude: 35.6762, longitude: 139.6503, description: 'A blend of ultramodern and traditional, from neon-lit streets to temples.' },
  { name: 'Dubai', country: 'UAE', region: 'Middle East', popularity: 88, cost_level: 'high', image: '/images/dubai.jpg', latitude: 25.2048, longitude: 55.2708, description: 'Futuristic city with towering skyscrapers and luxury experiences.' },
  { name: 'New York', country: 'United States', region: 'North America', popularity: 94, cost_level: 'high', image: '/images/newyork.jpg', latitude: 40.7128, longitude: -74.0060, description: 'The city that never sleeps, with iconic landmarks and diverse culture.' },
  { name: 'Mumbai', country: 'India', region: 'South Asia', popularity: 75, cost_level: 'low', image: '/images/mumbai.jpg', latitude: 19.0760, longitude: 72.8777, description: 'Bollywood capital with colonial architecture and street food.' },
  { name: 'Delhi', country: 'India', region: 'South Asia', popularity: 72, cost_level: 'low', image: '/images/delhi.jpg', latitude: 28.7041, longitude: 77.1025, description: 'Historic capital with Mughal architecture and bustling markets.' },
  { name: 'Singapore', country: 'Singapore', region: 'Southeast Asia', popularity: 86, cost_level: 'high', image: '/images/singapore.jpg', latitude: 1.3521, longitude: 103.8198, description: 'A futuristic garden city with world-class food and attractions.' },
  { name: 'Bangkok', country: 'Thailand', region: 'Southeast Asia', popularity: 84, cost_level: 'low', image: '/images/bangkok.jpg', latitude: 13.7563, longitude: 100.5018, description: 'Vibrant street life, ornate temples, and amazing street food.' },
  { name: 'Zurich', country: 'Switzerland', region: 'Western Europe', popularity: 80, cost_level: 'high', image: '/images/zurich.jpg', latitude: 47.3769, longitude: 8.5417, description: 'Financial hub with lakeside beauty and Swiss Alps views.' },
  { name: 'Barcelona', country: 'Spain', region: 'Southern Europe', popularity: 90, cost_level: 'medium', image: '/images/barcelona.jpg', latitude: 41.3874, longitude: 2.1686, description: 'Gaudí architecture, beaches, and lively nightlife.' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Western Europe', popularity: 82, cost_level: 'medium', image: '/images/amsterdam.jpg', latitude: 52.3676, longitude: 4.9041, description: 'Canals, museums, bikes, and a vibrant arts scene.' },
  { name: 'Kyoto', country: 'Japan', region: 'East Asia', popularity: 78, cost_level: 'medium', image: '/images/kyoto.jpg', latitude: 35.0116, longitude: 135.7681, description: 'Ancient capital with temples, geishas, and traditional gardens.' },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', popularity: 85, cost_level: 'high', image: '/images/sydney.jpg', latitude: -33.8688, longitude: 151.2093, description: 'Harbour city with the Opera House, beaches, and wildlife.' },
  { name: 'Santorini', country: 'Greece', region: 'Southern Europe', popularity: 87, cost_level: 'medium', image: '/images/santorini.jpg', latitude: 36.3932, longitude: 25.4615, description: 'Stunning sunsets, white-washed buildings, and volcanic beaches.' },
  { name: 'Istanbul', country: 'Turkey', region: 'Middle East', popularity: 81, cost_level: 'low', image: '/images/istanbul.jpg', latitude: 41.0082, longitude: 28.9784, description: 'Where East meets West, with bazaars, mosques, and incredible food.' },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', popularity: 77, cost_level: 'medium', image: '/images/capetown.jpg', latitude: -33.9249, longitude: 18.4241, description: 'Table Mountain, vineyards, and stunning coastal scenery.' },
];

const insertCity = db.prepare(
  'INSERT INTO cities (name, country, region, popularity, cost_level, image, latitude, longitude, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
const cityIds = {};
for (const c of cities) {
  const result = insertCity.run(c.name, c.country, c.region, c.popularity, c.cost_level, c.image, c.latitude, c.longitude, c.description);
  cityIds[c.name] = result.lastInsertRowid;
}

// --- Activities ---
const activitiesData = [
  // Paris
  { city: 'Paris', name: 'Eiffel Tower Visit', description: 'Ascend the iconic iron lattice tower for panoramic views of Paris.', category: 'sightseeing', duration: '2 hours', cost: 26, image: '/images/eiffel.jpg' },
  { city: 'Paris', name: 'Louvre Museum Tour', description: 'Explore the world\'s largest art museum, home to the Mona Lisa.', category: 'culture', duration: '3 hours', cost: 17, image: '/images/louvre.jpg' },
  { city: 'Paris', name: 'Seine River Cruise', description: 'A scenic boat cruise along the Seine passing major landmarks.', category: 'sightseeing', duration: '1.5 hours', cost: 15, image: '/images/seine.jpg' },
  { city: 'Paris', name: 'Montmartre Walking Tour', description: 'Wander through the artistic hilltop neighborhood and visit Sacré-Cœur.', category: 'culture', duration: '2 hours', cost: 0, image: '/images/montmartre.jpg' },
  { city: 'Paris', name: 'French Cooking Class', description: 'Learn to cook classic French dishes with a local chef.', category: 'food', duration: '3 hours', cost: 95, image: '/images/cooking.jpg' },
  // Rome
  { city: 'Rome', name: 'Colosseum Tour', description: 'Visit the ancient amphitheater and learn about gladiatorial combat.', category: 'culture', duration: '2.5 hours', cost: 16, image: '/images/colosseum.jpg' },
  { city: 'Rome', name: 'Vatican Museums', description: 'Explore the vast art collections and the Sistine Chapel.', category: 'culture', duration: '3 hours', cost: 17, image: '/images/vatican.jpg' },
  { city: 'Rome', name: 'Trastevere Food Tour', description: 'Taste your way through Rome\'s most charming food neighborhood.', category: 'food', duration: '3 hours', cost: 75, image: '/images/trastevere.jpg' },
  { city: 'Rome', name: 'Pompeii Day Trip', description: 'Visit the ancient Roman city preserved by volcanic ash.', category: 'sightseeing', duration: '5 hours', cost: 50, image: '/images/pompeii.jpg' },
  // Zurich
  { city: 'Zurich', name: 'Old Town Walking Tour', description: 'Discover Zurich\'s medieval old town and charming lanes.', category: 'culture', duration: '2 hours', cost: 0, image: '/images/zurich-oldtown.jpg' },
  { city: 'Zurich', name: 'Lake Zurich Boat Ride', description: 'Enjoy a relaxing boat cruise on the crystal-clear lake.', category: 'sightseeing', duration: '1.5 hours', cost: 25, image: '/images/lake-zurich.jpg' },
  { city: 'Zurich', name: 'Swiss Alps Excursion', description: 'Day trip to the breathtaking Swiss Alps with panoramic views.', category: 'adventure', duration: '8 hours', cost: 120, image: '/images/alps.jpg' },
  // Tokyo
  { city: 'Tokyo', name: 'Senso-ji Temple Visit', description: 'Visit Tokyo\'s oldest and most significant Buddhist temple.', category: 'culture', duration: '1.5 hours', cost: 0, image: '/images/sensoji.jpg' },
  { city: 'Tokyo', name: 'Shibuya Crossing & Harajuku', description: 'Experience the world\'s busiest intersection and trendy fashion district.', category: 'sightseeing', duration: '2 hours', cost: 0, image: '/images/shibuya.jpg' },
  { city: 'Tokyo', name: 'Tsukiji Outer Market Food Tour', description: 'Sample fresh sushi, street food, and Japanese delicacies.', category: 'food', duration: '2.5 hours', cost: 80, image: '/images/tsukiji.jpg' },
  { city: 'Tokyo', name: 'Akihabara Anime District', description: 'Explore the electronics and anime paradise of Tokyo.', category: 'entertainment', duration: '3 hours', cost: 0, image: '/images/akihabara.jpg' },
  // Barcelona
  { city: 'Barcelona', name: 'Sagrada Familia Tour', description: 'Visit Gaudí\'s masterpiece basilica, still under construction.', category: 'culture', duration: '2 hours', cost: 26, image: '/images/sagrada.jpg' },
  { city: 'Barcelona', name: 'La Boqueria Market', description: 'Explore the famous food market on Las Ramblas.', category: 'food', duration: '1.5 hours', cost: 0, image: '/images/boqueria.jpg' },
  { city: 'Barcelona', name: 'Park Güell Visit', description: 'Wander through Gaudí\'s colorful mosaic park with city views.', category: 'sightseeing', duration: '2 hours', cost: 10, image: '/images/parkguell.jpg' },
  { city: 'Barcelona', name: 'Beach Day at Barceloneta', description: 'Relax at Barcelona\'s most popular urban beach.', category: 'nature', duration: '4 hours', cost: 0, image: '/images/barceloneta.jpg' },
  // Bangkok
  { city: 'Bangkok', name: 'Grand Palace Tour', description: 'Visit the spectacular former royal residence and Wat Phra Kaew.', category: 'culture', duration: '3 hours', cost: 16, image: '/images/grandpalace.jpg' },
  { city: 'Bangkok', name: 'Street Food Adventure', description: 'Taste pad thai, mango sticky rice, and more from street vendors.', category: 'food', duration: '3 hours', cost: 20, image: '/images/bangkokfood.jpg' },
  { city: 'Bangkok', name: 'Floating Market Visit', description: 'Take a boat through the colorful Damnoen Saduak floating market.', category: 'sightseeing', duration: '4 hours', cost: 30, image: '/images/floatingmarket.jpg' },
  // Singapore
  { city: 'Singapore', name: 'Gardens by the Bay', description: 'Explore the futuristic Supertree Grove and cloud forest.', category: 'nature', duration: '3 hours', cost: 28, image: '/images/gardensbay.jpg' },
  { city: 'Singapore', name: 'Hawker Centre Food Tour', description: 'Sample Michelin-starred street food at local hawker centres.', category: 'food', duration: '2 hours', cost: 15, image: '/images/hawker.jpg' },
  // New York
  { city: 'New York', name: 'Statue of Liberty & Ellis Island', description: 'Ferry to Lady Liberty and the immigrant history museum.', category: 'sightseeing', duration: '4 hours', cost: 24, image: '/images/liberty.jpg' },
  { city: 'New York', name: 'Central Park Bike Ride', description: 'Cycle through the iconic 843-acre urban park.', category: 'adventure', duration: '2 hours', cost: 20, image: '/images/centralpark.jpg' },
  { city: 'New York', name: 'Broadway Show', description: 'Catch a world-class musical or play in the Theater District.', category: 'entertainment', duration: '3 hours', cost: 120, image: '/images/broadway.jpg' },
  // Dubai
  { city: 'Dubai', name: 'Burj Khalifa Observation Deck', description: 'Visit the world\'s tallest building for stunning city views.', category: 'sightseeing', duration: '2 hours', cost: 40, image: '/images/burjkhalifa.jpg' },
  { city: 'Dubai', name: 'Desert Safari Adventure', description: 'Dune bashing, camel riding, and traditional dinner in the desert.', category: 'adventure', duration: '5 hours', cost: 85, image: '/images/desert.jpg' },
  // London
  { city: 'London', name: 'Tower of London', description: 'Explore the historic castle and see the Crown Jewels.', category: 'culture', duration: '3 hours', cost: 30, image: '/images/tower.jpg' },
  { city: 'London', name: 'Thames River Cruise', description: 'See London\'s landmarks from the water on a relaxing cruise.', category: 'sightseeing', duration: '1 hour', cost: 18, image: '/images/thames.jpg' },
  { city: 'London', name: 'Borough Market Food Tour', description: 'Sample artisan foods at London\'s oldest food market.', category: 'food', duration: '2 hours', cost: 0, image: '/images/borough.jpg' },
  // Santorini
  { city: 'Santorini', name: 'Oia Sunset Viewing', description: 'Watch the famous sunset from the village of Oia.', category: 'sightseeing', duration: '2 hours', cost: 0, image: '/images/oia.jpg' },
  { city: 'Santorini', name: 'Wine Tasting Tour', description: 'Sample Assyrtiko wines at volcanic vineyards.', category: 'food', duration: '3 hours', cost: 65, image: '/images/wine.jpg' },
  // Amsterdam
  { city: 'Amsterdam', name: 'Anne Frank House', description: 'Visit the hiding place where Anne Frank wrote her diary.', category: 'culture', duration: '1.5 hours', cost: 16, image: '/images/annefrank.jpg' },
  { city: 'Amsterdam', name: 'Canal Cruise', description: 'A boat tour through Amsterdam\'s UNESCO-listed canals.', category: 'sightseeing', duration: '1 hour', cost: 18, image: '/images/amsterdamcanal.jpg' },
  // Istanbul
  { city: 'Istanbul', name: 'Hagia Sophia Visit', description: 'Marvel at the architectural wonder that has served as church, mosque, and museum.', category: 'culture', duration: '2 hours', cost: 25, image: '/images/hagia.jpg' },
  { city: 'Istanbul', name: 'Grand Bazaar Shopping', description: 'Get lost in one of the world\'s oldest and largest covered markets.', category: 'shopping', duration: '3 hours', cost: 0, image: '/images/bazaar.jpg' },
  // Kyoto
  { city: 'Kyoto', name: 'Fushimi Inari Shrine', description: 'Walk through thousands of vermillion torii gates.', category: 'culture', duration: '2 hours', cost: 0, image: '/images/fushimi.jpg' },
  { city: 'Kyoto', name: 'Bamboo Forest Walk', description: 'Stroll through the enchanting Arashiyama bamboo grove.', category: 'nature', duration: '1.5 hours', cost: 0, image: '/images/bamboo.jpg' },
];

const insertActivity = db.prepare(
  'INSERT INTO activities (city_id, name, description, category, duration, estimated_cost, image) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const a of activitiesData) {
  insertActivity.run(cityIds[a.city], a.name, a.description, a.category, a.duration, a.cost, a.image);
}

// --- Demo User ---
const passwordHash = bcrypt.hashSync('demo123', 10);
const userResult = db.prepare(
  'INSERT INTO users (name, email, password_hash, profile_image) VALUES (?, ?, ?, ?)'
).run('Alex Traveler', 'demo@globetrotter.com', passwordHash, null);
const userId = userResult.lastInsertRowid;

// Second user
const user2Result = db.prepare(
  'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
).run('Sam Explorer', 'sam@globetrotter.com', bcrypt.hashSync('sam123', 10));

// --- Sample Trip 1: Europe Summer Adventure ---
const trip1 = db.prepare(
  'INSERT INTO trips (user_id, name, description, start_date, end_date, budget, visibility, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).run(userId, 'Europe Summer Adventure', 'Exploring the best of France, Switzerland, and Italy over two weeks.', '2025-06-10', '2025-06-25', 5000, 'public', '/images/trip-europe.jpg');
const trip1Id = trip1.lastInsertRowid;

// Stops
const stop1 = db.prepare(
  'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, transportation, accommodation, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).run(trip1Id, cityIds['Paris'], '2025-06-10', '2025-06-14', 0, 'Flight from home', 'Hotel Le Marais', 'Arrive by noon');
const stop1Id = stop1.lastInsertRowid;

const stop2 = db.prepare(
  'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, transportation, accommodation, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).run(trip1Id, cityIds['Zurich'], '2025-06-14', '2025-06-18', 1, 'TGV Train from Paris', 'Hotel Schweizerhof', 'Scenic train ride');
const stop2Id = stop2.lastInsertRowid;

const stop3 = db.prepare(
  'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, transportation, accommodation, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).run(trip1Id, cityIds['Rome'], '2025-06-18', '2025-06-25', 2, 'Flight from Zurich', 'Hotel Roma Cavalieri', 'Final stop');
const stop3Id = stop3.lastInsertRowid;

// Trip Activities for Stop 1 (Paris)
const insertTA = db.prepare(
  'INSERT INTO trip_activities (trip_stop_id, activity_id, name, date, start_time, notes, estimated_cost, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
insertTA.run(stop1Id, null, 'Eiffel Tower Visit', '2025-06-11', '09:00', 'Book tickets online', 26, 'sightseeing');
insertTA.run(stop1Id, null, 'Louvre Museum Tour', '2025-06-11', '14:00', 'Bring water', 17, 'culture');
insertTA.run(stop1Id, null, 'Montmartre Walking Tour', '2025-06-12', '10:00', 'Wear comfortable shoes', 0, 'culture');
insertTA.run(stop1Id, null, 'Seine River Cruise', '2025-06-12', '16:00', 'Sunset cruise', 15, 'sightseeing');
insertTA.run(stop1Id, null, 'French Cooking Class', '2025-06-13', '11:00', 'Book in advance', 95, 'food');

// Trip Activities for Stop 2 (Zurich)
insertTA.run(stop2Id, null, 'Old Town Walking Tour', '2025-06-15', '10:00', 'Meet at Bahnhofstrasse', 0, 'culture');
insertTA.run(stop2Id, null, 'Lake Zurich Boat Ride', '2025-06-16', '14:00', '', 25, 'sightseeing');
insertTA.run(stop2Id, null, 'Swiss Alps Excursion', '2025-06-17', '08:00', 'Full day trip', 120, 'adventure');

// Trip Activities for Stop 3 (Rome)
insertTA.run(stop3Id, null, 'Colosseum Tour', '2025-06-19', '09:00', 'Skip the line tickets', 16, 'culture');
insertTA.run(stop3Id, null, 'Vatican Museums', '2025-06-20', '08:30', 'Dress code: no shorts', 17, 'culture');
insertTA.run(stop3Id, null, 'Trastevere Food Tour', '2025-06-21', '12:00', 'Come hungry!', 75, 'food');
insertTA.run(stop3Id, null, 'Pompeii Day Trip', '2025-06-23', '07:00', 'Full day excursion', 50, 'sightseeing');

// Expenses for Trip 1
const insertExp = db.prepare(
  'INSERT INTO expenses (trip_id, category, amount, description, date, city_id) VALUES (?, ?, ?, ?, ?, ?)'
);
insertExp.run(trip1Id, 'Transportation', 450, 'Flight to Paris', '2025-06-10', cityIds['Paris']);
insertExp.run(trip1Id, 'Transportation', 180, 'TGV Paris to Zurich', '2025-06-14', cityIds['Paris']);
insertExp.run(trip1Id, 'Transportation', 120, 'Flight Zurich to Rome', '2025-06-18', cityIds['Zurich']);
insertExp.run(trip1Id, 'Accommodation', 800, 'Hotel Le Marais (4 nights)', '2025-06-10', cityIds['Paris']);
insertExp.run(trip1Id, 'Accommodation', 600, 'Hotel Schweizerhof (4 nights)', '2025-06-14', cityIds['Zurich']);
insertExp.run(trip1Id, 'Accommodation', 840, 'Hotel Roma Cavalieri (7 nights)', '2025-06-18', cityIds['Rome']);
insertExp.run(trip1Id, 'Activities', 153, 'Paris activities', '2025-06-11', cityIds['Paris']);
insertExp.run(trip1Id, 'Activities', 145, 'Zurich activities', '2025-06-15', cityIds['Zurich']);
insertExp.run(trip1Id, 'Activities', 158, 'Rome activities', '2025-06-19', cityIds['Rome']);
insertExp.run(trip1Id, 'Food', 300, 'Paris dining', '2025-06-11', cityIds['Paris']);
insertExp.run(trip1Id, 'Food', 250, 'Zurich dining', '2025-06-15', cityIds['Zurich']);
insertExp.run(trip1Id, 'Food', 200, 'Rome dining', '2025-06-19', cityIds['Rome']);
insertExp.run(trip1Id, 'Shopping', 100, 'Souvenirs in Paris', '2025-06-13', cityIds['Paris']);

// --- Sample Trip 2: Japan Discovery ---
const trip2 = db.prepare(
  'INSERT INTO trips (user_id, name, description, start_date, end_date, budget, visibility, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
).run(userId, 'Japan Discovery', 'A journey through Tokyo and Kyoto to experience Japanese culture.', '2025-10-01', '2025-10-12', 4000, 'private', '/images/trip-japan.jpg');
const trip2Id = trip2.lastInsertRowid;

const stop4 = db.prepare(
  'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, transportation, accommodation) VALUES (?, ?, ?, ?, ?, ?, ?)'
).run(trip2Id, cityIds['Tokyo'], '2025-10-01', '2025-10-07', 0, 'Flight from home', 'Shinjuku Granbell Hotel');
const stop4Id = stop4.lastInsertRowid;

const stop5 = db.prepare(
  'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, order_index, transportation, accommodation) VALUES (?, ?, ?, ?, ?, ?, ?)'
).run(trip2Id, cityIds['Kyoto'], '2025-10-07', '2025-10-12', 1, 'Shinkansen', 'Kyoto Granbell Hotel');
const stop5Id = stop5.lastInsertRowid;

// Trip Activities for Trip 2
insertTA.run(stop4Id, null, 'Senso-ji Temple Visit', '2025-10-02', '09:00', 'Early morning for fewer crowds', 0, 'culture');
insertTA.run(stop4Id, null, 'Shibuya & Harajuku Walk', '2025-10-03', '11:00', 'Explore Takeshita Street', 0, 'sightseeing');
insertTA.run(stop4Id, null, 'Tsukiji Food Tour', '2025-10-04', '08:00', 'Early start', 80, 'food');
insertTA.run(stop4Id, null, 'Akihabara Anime District', '2025-10-05', '13:00', 'Bring extra luggage space', 0, 'entertainment');
insertTA.run(stop5Id, null, 'Fushimi Inari Shrine', '2025-10-08', '08:00', 'Hike the full trail', 0, 'culture');
insertTA.run(stop5Id, null, 'Bamboo Forest Walk', '2025-10-09', '10:00', 'Arashiyama district', 0, 'nature');

// Expenses for Trip 2
insertExp.run(trip2Id, 'Transportation', 800, 'Flight to Tokyo', '2025-10-01', cityIds['Tokyo']);
insertExp.run(trip2Id, 'Transportation', 130, 'Shinkansen Tokyo to Kyoto', '2025-10-07', cityIds['Tokyo']);
insertExp.run(trip2Id, 'Accommodation', 700, 'Shinjuku Granbell (6 nights)', '2025-10-01', cityIds['Tokyo']);
insertExp.run(trip2Id, 'Accommodation', 550, 'Kyoto Granbell (5 nights)', '2025-10-07', cityIds['Kyoto']);
insertExp.run(trip2Id, 'Food', 400, 'Tokyo dining', '2025-10-02', cityIds['Tokyo']);
insertExp.run(trip2Id, 'Food', 250, 'Kyoto dining', '2025-10-08', cityIds['Kyoto']);

// --- Favorites ---
db.prepare('INSERT INTO favorites (user_id, city_id) VALUES (?, ?)').run(userId, cityIds['Paris']);
db.prepare('INSERT INTO favorites (user_id, city_id) VALUES (?, ?)').run(userId, cityIds['Tokyo']);
db.prepare('INSERT INTO favorites (user_id, city_id) VALUES (?, ?)').run(userId, cityIds['Rome']);
db.prepare('INSERT INTO favorites (user_id, city_id) VALUES (?, ?)').run(userId, cityIds['Santorini']);

console.log('✅ Database seeded successfully!');
console.log(`   - ${cities.length} cities`);
console.log(`   - ${activitiesData.length} activities`);
console.log(`   - 2 users (demo@globetrotter.com / demo123)`);
console.log(`   - 2 trips with stops, activities, and expenses`);
console.log(`   - 4 favorite cities`);
