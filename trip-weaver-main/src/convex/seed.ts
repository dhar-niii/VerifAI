import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already seeded
    const existingCities = await ctx.db.query("cities").first();
    if (existingCities) return "already_seeded";

    // Seed Cities
    const cityData = [
      { name: "Paris", country: "France", region: "Europe", popularity: 98, costLevel: "High", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", description: "The City of Light, known for the Eiffel Tower and world-class cuisine.", latitude: 48.8566, longitude: 2.3522 },
      { name: "London", country: "United Kingdom", region: "Europe", popularity: 95, costLevel: "High", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800", description: "A historic metropolis with iconic landmarks and vibrant culture.", latitude: 51.5074, longitude: -0.1278 },
      { name: "Rome", country: "Italy", region: "Europe", popularity: 92, costLevel: "Medium", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800", description: "The Eternal City with ancient ruins and incredible food.", latitude: 41.9028, longitude: 12.4964 },
      { name: "Tokyo", country: "Japan", region: "Asia", popularity: 94, costLevel: "Medium", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", description: "A perfect blend of tradition and cutting-edge technology.", latitude: 35.6762, longitude: 139.6503 },
      { name: "Dubai", country: "UAE", region: "Middle East", popularity: 90, costLevel: "High", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", description: "A futuristic city of superlatives and luxury.", latitude: 25.2048, longitude: 55.2708 },
      { name: "New York", country: "United States", region: "North America", popularity: 96, costLevel: "High", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", description: "The city that never sleeps, with endless entertainment.", latitude: 40.7128, longitude: -74.006 },
      { name: "Mumbai", country: "India", region: "Asia", popularity: 78, costLevel: "Low", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800", description: "The city of dreams, Bollywood, and incredible street food.", latitude: 19.076, longitude: 72.8777 },
      { name: "Delhi", country: "India", region: "Asia", popularity: 75, costLevel: "Low", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800", description: "India's capital with a rich Mughal heritage.", latitude: 28.7041, longitude: 77.1025 },
      { name: "Singapore", country: "Singapore", region: "Asia", popularity: 88, costLevel: "Medium", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800", description: "A futuristic garden city with diverse cultures.", latitude: 1.3521, longitude: 103.8198 },
      { name: "Bangkok", country: "Thailand", region: "Asia", popularity: 85, costLevel: "Low", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800", description: "Street food paradise with stunning temples and nightlife.", latitude: 13.7563, longitude: 100.5018 },
      { name: "Zurich", country: "Switzerland", region: "Europe", popularity: 82, costLevel: "High", image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800", description: "A pristine city of lakes, mountains, and chocolate.", latitude: 47.3769, longitude: 8.5417 },
      { name: "Barcelona", country: "Spain", region: "Europe", popularity: 91, costLevel: "Medium", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800", description: "Gaudí's masterpieces meet Mediterranean charm.", latitude: 41.3874, longitude: 2.1686 },
      { name: "Bali", country: "Indonesia", region: "Asia", popularity: 87, costLevel: "Low", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", description: "Island of the gods with temples, rice terraces, and beaches.", latitude: -8.3405, longitude: 115.092 },
      { name: "Amsterdam", country: "Netherlands", region: "Europe", popularity: 84, costLevel: "Medium", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800", description: "Canals, art museums, and vibrant cycling culture.", latitude: 52.3676, longitude: 4.9041 },
      { name: "Cairo", country: "Egypt", region: "Africa", popularity: 76, costLevel: "Low", image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800", description: "Ancient pyramids and the mighty Nile River.", latitude: 30.0444, longitude: 31.2357 },
    ];

    const cityIds: Record<string, any> = {};
    for (const city of cityData) {
      const id = await ctx.db.insert("cities", city);
      cityIds[city.name] = id;
    }

    // Seed Activities
    const activityData = [
      // Paris
      { cityId: cityIds["Paris"], name: "Eiffel Tower Visit", description: "Ascend the iconic iron lattice tower for panoramic views of Paris.", category: "Sightseeing", duration: 3, estimatedCost: 26, image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=400" },
      { cityId: cityIds["Paris"], name: "Louvre Museum Tour", description: "Explore the world's largest art museum and see the Mona Lisa.", category: "Culture", duration: 4, estimatedCost: 17, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400" },
      { cityId: cityIds["Paris"], name: "Seine River Cruise", description: "A scenic boat tour along the Seine passing major landmarks.", category: "Sightseeing", duration: 1, estimatedCost: 15, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400" },
      { cityId: cityIds["Paris"], name: "French Pastry Class", description: "Learn to make croissants and macarons with a local chef.", category: "Food", duration: 3, estimatedCost: 80, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
      { cityId: cityIds["Paris"], name: "Champs-Élysées Shopping", description: "Stroll down the most famous avenue in the world.", category: "Shopping", duration: 2, estimatedCost: 0, image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400" },
      { cityId: cityIds["Paris"], name: "Montmartre Walk", description: "Explore the artistic hilltop neighborhood with Sacré-Cœur.", category: "Sightseeing", duration: 2, estimatedCost: 0 },
      // London
      { cityId: cityIds["London"], name: "Tower of London", description: "Discover 1000 years of history and see the Crown Jewels.", category: "Culture", duration: 3, estimatedCost: 33, image: "https://images.unsplash.com/photo-1543832923-44667a44c860?w=400" },
      { cityId: cityIds["London"], name: "British Museum Visit", description: "Explore one of the world's greatest museums, free of charge.", category: "Culture", duration: 3, estimatedCost: 0, image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=400" },
      { cityId: cityIds["London"], name: "Thames River Walk", description: "Walk along the Thames passing Big Ben and the London Eye.", category: "Sightseeing", duration: 2, estimatedCost: 0 },
      { cityId: cityIds["London"], name: "Afternoon Tea Experience", description: "Enjoy a traditional English afternoon tea at a historic hotel.", category: "Food", duration: 2, estimatedCost: 50, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400" },
      // Rome
      { cityId: cityIds["Rome"], name: "Colosseum Tour", description: "Step inside the ancient amphitheater where gladiators fought.", category: "Culture", duration: 3, estimatedCost: 16, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400" },
      { cityId: cityIds["Rome"], name: "Vatican Museums", description: "Explore the vast art collections and the Sistine Chapel.", category: "Culture", duration: 4, estimatedCost: 17, image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=400" },
      { cityId: cityIds["Rome"], name: "Trastevere Food Tour", description: "Taste authentic Roman cuisine in the charming Trastevere district.", category: "Food", duration: 3, estimatedCost: 75, image: "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=400" },
      { cityId: cityIds["Rome"], name: "Trevi Fountain Visit", description: "Toss a coin and make a wish at the famous Baroque fountain.", category: "Sightseeing", duration: 1, estimatedCost: 0 },
      // Tokyo
      { cityId: cityIds["Tokyo"], name: "Senso-ji Temple", description: "Visit Tokyo's oldest and most significant Buddhist temple.", category: "Culture", duration: 2, estimatedCost: 0, image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
      { cityId: cityIds["Tokyo"], name: "Tsukiji Outer Market", description: "Fresh sushi and street food at the famous fish market.", category: "Food", duration: 2, estimatedCost: 30, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" },
      { cityId: cityIds["Tokyo"], name: "Shibuya Crossing", description: "Experience the world's busiest pedestrian crossing.", category: "Sightseeing", duration: 1, estimatedCost: 0 },
      { cityId: cityIds["Tokyo"], name: "Meiji Shrine", description: "A tranquil Shinto shrine surrounded by a lush forest.", category: "Culture", duration: 2, estimatedCost: 0 },
      { cityId: cityIds["Tokyo"], name: "Akihabara Electronics Tour", description: "Explore the neon-lit hub of anime, manga, and electronics.", category: "Shopping", duration: 3, estimatedCost: 0 },
      // Dubai
      { cityId: cityIds["Dubai"], name: "Burj Khalifa Observation", description: "Visit the world's tallest building and its observation deck.", category: "Sightseeing", duration: 2, estimatedCost: 40, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400" },
      { cityId: cityIds["Dubai"], name: "Desert Safari", description: "Thrilling dune bashing and camel riding in the Arabian desert.", category: "Adventure", duration: 5, estimatedCost: 80, image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=400" },
      { cityId: cityIds["Dubai"], name: "Dubai Mall Shopping", description: "Shop at one of the world's largest malls with an aquarium.", category: "Shopping", duration: 4, estimatedCost: 0 },
      // New York
      { cityId: cityIds["New York"], name: "Statue of Liberty Tour", description: "Take a ferry to see Lady Liberty up close.", category: "Sightseeing", duration: 4, estimatedCost: 24, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400" },
      { cityId: cityIds["New York"], name: "Central Park Bike Ride", description: "Cycle through the iconic 843-acre urban park.", category: "Adventure", duration: 2, estimatedCost: 20 },
      { cityId: cityIds["New York"], name: "Broadway Show", description: "Catch a world-class theatrical performance.", category: "Entertainment", duration: 3, estimatedCost: 120, image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400" },
      { cityId: cityIds["New York"], name: "Brooklyn Bridge Walk", description: "Walk across the iconic suspension bridge for skyline views.", category: "Sightseeing", duration: 1, estimatedCost: 0 },
      // Barcelona
      { cityId: cityIds["Barcelona"], name: "Sagrada Família Visit", description: "Marvel at Gaudí's unfinished masterpiece basilica.", category: "Culture", duration: 2, estimatedCost: 26, image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400" },
      { cityId: cityIds["Barcelona"], name: "La Boqueria Market", description: "Explore the vibrant food market on La Rambla.", category: "Food", duration: 2, estimatedCost: 20, image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400" },
      { cityId: cityIds["Barcelona"], name: "Park Güell", description: "Explore Gaudí's colorful public park with mosaic benches.", category: "Sightseeing", duration: 2, estimatedCost: 10 },
      { cityId: cityIds["Barcelona"], name: "Gothic Quarter Walk", description: "Wander through medieval streets and hidden plazas.", category: "Sightseeing", duration: 2, estimatedCost: 0 },
      // Singapore
      { cityId: cityIds["Singapore"], name: "Marina Bay Sands SkyPark", description: "Take in panoramic views from the iconic rooftop.", category: "Sightseeing", duration: 1, estimatedCost: 26, image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400" },
      { cityId: cityIds["Singapore"], name: "Hawker Centre Food Tour", description: "Taste award-winning street food at hawker centres.", category: "Food", duration: 3, estimatedCost: 15, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
      { cityId: cityIds["Singapore"], name: "Gardens by the Bay", description: "Explore the futuristic Supertree Grove and conservatories.", category: "Nature", duration: 3, estimatedCost: 28 },
      // Bangkok
      { cityId: cityIds["Bangkok"], name: "Grand Palace Tour", description: "Visit the dazzling former royal residence.", category: "Culture", duration: 3, estimatedCost: 16, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400" },
      { cityId: cityIds["Bangkok"], name: "Floating Market Visit", description: "Shop from boats at the colorful floating markets.", category: "Shopping", duration: 4, estimatedCost: 10 },
      { cityId: cityIds["Bangkok"], name: "Thai Cooking Class", description: "Learn to cook pad thai and green curry from local chefs.", category: "Food", duration: 3, estimatedCost: 40, image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400" },
      // Zurich
      { cityId: cityIds["Zurich"], name: "Lake Zurich Cruise", description: "Enjoy a scenic boat cruise on the pristine lake.", category: "Sightseeing", duration: 2, estimatedCost: 20, image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=400" },
      { cityId: cityIds["Zurich"], name: "Old Town Walking Tour", description: "Explore the medieval Altstadt with its cobblestone streets.", category: "Culture", duration: 2, estimatedCost: 0 },
      { cityId: cityIds["Zurich"], name: "Swiss Chocolate Workshop", description: "Create your own Swiss chocolate creations.", category: "Food", duration: 2, estimatedCost: 60, image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400" },
      // Mumbai
      { cityId: cityIds["Mumbai"], name: "Gateway of India Visit", description: "See the iconic arch monument overlooking the Arabian Sea.", category: "Sightseeing", duration: 1, estimatedCost: 0, image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400" },
      { cityId: cityIds["Mumbai"], name: "Street Food Tour", description: "Taste vada pav, pav bhaji, and more on a local food walk.", category: "Food", duration: 3, estimatedCost: 10, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400" },
      // Delhi
      { cityId: cityIds["Delhi"], name: "Red Fort Visit", description: "Explore the magnificent Mughal fortress.", category: "Culture", duration: 2, estimatedCost: 8, image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400" },
      { cityId: cityIds["Delhi"], name: "Chandni Chowk Walk", description: "Navigate the bustling bazaar of Old Delhi.", category: "Shopping", duration: 3, estimatedCost: 5 },
      // Amsterdam
      { cityId: cityIds["Amsterdam"], name: "Van Gogh Museum", description: "See the largest collection of Van Gogh's works.", category: "Culture", duration: 2, estimatedCost: 20, image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400" },
      { cityId: cityIds["Amsterdam"], name: "Canal Boat Tour", description: "Cruise through Amsterdam's UNESCO World Heritage canals.", category: "Sightseeing", duration: 1, estimatedCost: 18 },
      // Bali
      { cityId: cityIds["Bali"], name: "Ubud Rice Terraces", description: "Walk through the stunning Tegallalang rice terraces.", category: "Nature", duration: 3, estimatedCost: 5, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
      { cityId: cityIds["Bali"], name: "Temple Visit", description: "Explore ancient Hindu temples including Tanah Lot.", category: "Culture", duration: 4, estimatedCost: 10, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400" },
      // Cairo
      { cityId: cityIds["Cairo"], name: "Pyramids of Giza", description: "Visit the last remaining wonder of the ancient world.", category: "Sightseeing", duration: 4, estimatedCost: 20, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400" },
      { cityId: cityIds["Cairo"], name: "Egyptian Museum Tour", description: "See Tutankhamun's treasures and ancient artifacts.", category: "Culture", duration: 3, estimatedCost: 12 },
    ];

    const activityIds: any[] = [];
    for (const activity of activityData) {
      const id = await ctx.db.insert("activities", activity);
      activityIds.push(id);
    }

    return { citiesCount: cityData.length, activitiesCount: activityData.length };
  },
});

export const getSeededCities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cities").collect();
  },
});

export const getSeededActivities = query({
  args: { cityId: v.optional(v.id("cities")) },
  handler: async (ctx, args) => {
    if (args.cityId) {
      return await ctx.db.query("activities").withIndex("by_city", (q) => q.eq("cityId", args.cityId!)).collect();
    }
    return await ctx.db.query("activities").collect();
  },
});

export const checkSeeded = query({
  args: {},
  handler: async (ctx) => {
    const city = await ctx.db.query("cities").first();
    return city !== null;
  },
});
