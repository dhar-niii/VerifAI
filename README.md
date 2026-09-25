# 🌍 GlobeTrotter — Empowering Personalized Travel Planning

A full-stack web application that allows users to create, organize, visualize, budget, and share multi-city travel itineraries.

## 📋 Problem Statement

Travel planning is often fragmented across multiple apps, spreadsheets, and notes. GlobeTrotter consolidates the entire travel planning experience into one beautiful, interactive platform where users can:

- Build detailed multi-city itineraries with day-by-day activities
- Track and visualize trip budgets with charts
- View trips on an interactive calendar/timeline
- Share public itineraries with friends
- Discover cities and activities worldwide

## ✨ Features

### Core Features
- **Authentication** — Sign up, login, logout with JWT-based auth
- **Dashboard** — Welcome screen with stats, upcoming trips, favorites, budget overview
- **Trip Management** — Create, edit, delete trips with dates, budget, and descriptions
- **Multi-City Itinerary** — Add stops/cities with arrival/departure dates, transport, accommodation
- **Activity Management** — Add activities per stop with categories, times, costs
- **City Search** — Search and filter 18 world cities with cost levels and favorites
- **Activity Search** — Browse activities by category, cost, and duration
- **Budget Tracking** — Track expenses by category and city with pie/bar charts
- **Calendar/Timeline** — Day-by-day view of the entire trip with activities
- **Public Sharing** — Generate shareable read-only itinerary links
- **Profile Settings** — Edit name, email, language, change password, delete account

### Design
- Modern, responsive UI that works on desktop and mobile
- Custom CSS design system with consistent variables
- Smooth animations and hover effects
- Loading states, error handling, empty states, and notifications

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router 6, Recharts, React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via better-sqlite3) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Styling** | Custom CSS with CSS Variables (design system) |

## 🏗️ Architecture

```
globetrotter/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── database/
│   │   ├── init.js            # Schema creation & DB connection
│   │   └── seed.js            # Demo data seeder
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   └── routes/
│       ├── auth.js            # Signup, login, get current user
│       ├── trips.js           # Trip CRUD + public sharing
│       ├── stops.js           # Stop & trip activity management
│       ├── cities.js          # City search, favorites
│       ├── activities.js      # Activity search & categories
│       ├── expenses.js        # Expense tracking
│       └── profile.js         # User profile management
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # App entry point
│   │   ├── App.jsx            # Routes configuration
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state management
│   │   ├── services/
│   │   │   └── api.js         # API client (fetch wrapper)
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar + responsive layout
│   │   │   ├── Modal.jsx      # Reusable modal dialog
│   │   │   └── Toast.jsx      # Toast notifications
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Public landing page
│   │   │   ├── Login.jsx      # Login form
│   │   │   ├── Signup.jsx     # Signup form
│   │   │   ├── Dashboard.jsx  # Dashboard with stats
│   │   │   ├── MyTrips.jsx    # Trip listing with filters
│   │   │   ├── CreateTrip.jsx # New trip form
│   │   │   ├── TripDetail.jsx # Trip overview + stops
│   │   │   ├── ItineraryBuilder.jsx # Day-by-day builder
│   │   │   ├── CitySearch.jsx # City discovery
│   │   │   ├── ActivitySearch.jsx # Activity browser
│   │   │   ├── Budget.jsx     # Expense tracking + charts
│   │   │   ├── Calendar.jsx   # Day-by-day timeline
│   │   │   ├── SharedTrip.jsx # Public shared view
│   │   │   └── Profile.jsx    # Account settings
│   │   └── styles/
│   │       └── index.css      # Complete design system
│   └── vite.config.js         # Vite config with API proxy
└── setup.sh                   # One-click setup script
```

## 🗄️ Database Schema

Relational design with proper foreign keys:

- **users** — id, name, email, password_hash, profile_image, language
- **cities** — id, name, country, region, popularity, cost_level, image
- **activities** — id, city_id (FK), name, description, category, duration, estimated_cost
- **trips** — id, user_id (FK), name, description, start_date, end_date, budget, visibility
- **trip_stops** — id, trip_id (FK), city_id (FK), arrival_date, departure_date, order_index
- **trip_activities** — id, trip_stop_id (FK), activity_id (FK), date, start_time, notes
- **expenses** — id, trip_id (FK), category, amount, description, date, city_id (FK)
- **favorites** — id, user_id (FK), city_id (FK)

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ (https://nodejs.org)
- npm (comes with Node.js)

### Quick Start

```bash
# 1. Clone or download the project
cd globetrotter

# 2. Run the setup script
bash setup.sh

# 3. Start the backend (Terminal 1)
cd backend
npm start
# Runs on http://localhost:5000

# 4. Start the frontend (Terminal 2)
cd frontend
npm run dev
# Opens on http://localhost:3000
```

### Manual Setup

```bash
# Backend
cd backend
cp .env.example .env    # Edit .env with your settings
npm install
node database/seed.js    # Seed demo data

# Frontend
cd frontend
npm install
npm run dev
```

## 🔐 Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@globetrotter.com` |
| Password | `demo123` |

The demo account comes pre-loaded with:
- 2 sample trips (Europe Summer Adventure, Japan Discovery)
- 18 world cities with descriptions
- 40+ activities across categories
- Sample expenses and itinerary stops
- 4 favorite cities

## 🌐 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `JWT_SECRET` | Secret key for JWT tokens | (change in production) |
| `DB_PATH` | SQLite database file path | ./database/globetrotter.db |
| `NODE_ENV` | Environment mode | development |

## 📡 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List user's trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/:id` | Get trip with stops & activities |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |

### Stops & Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trips/:tripId/stops` | Add stop to trip |
| PUT | `/api/stops/:id` | Update stop |
| DELETE | `/api/stops/:id` | Delete stop |
| POST | `/api/stops/:stopId/activities` | Add activity to stop |
| DELETE | `/api/trip-activities/:id` | Remove activity |

### Cities & Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cities` | Search cities |
| GET | `/api/activities` | Search activities |
| GET | `/api/activities/categories` | List categories |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips/:tripId/expenses` | List expenses + summary |
| POST | `/api/trips/:tripId/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Sharing & Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips/public/:id` | Get public itinerary |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |

## 🎯 How the Demo Flow Works

1. **Login** → Use demo@globetrotter.com / demo123
2. **Dashboard** → See welcome message, stats, 2 pre-made trips, favorites
3. **My Trips** → View all trips with filter chips (All/Upcoming/Planning/Completed)
4. **Create Trip** → Fill form with name, dates, budget → redirects to itinerary
5. **Itinerary Builder** → Add stops (cities), add activities per stop with times
6. **Explore Cities** → Search 18 cities, filter by region, favorite cities
7. **Activities** → Browse 40+ activities by category (sightseeing, food, adventure, etc.)
8. **Budget** → Add expenses, see pie chart (by category), bar chart (by city)
9. **Calendar** → Day-by-day expandable timeline of the entire trip
10. **Share** → Click Share on a trip → copies public URL → opens read-only page
11. **Profile** → Edit name/email, change password, manage favorites

## 🔮 Future Improvements

- [ ] Drag-and-drop activity reordering
- [ ] Integration with Google Maps for city visualization
- [ ] Real-time collaboration on shared trips
- [ ] Export itinerary as PDF
- [ ] Weather forecast integration
- [ ] Flight/hotel booking integration
- [ ] Currency conversion
- [ ] Photo uploads for trip memories
- [ ] Mobile app (React Native)
- [ ] Admin analytics dashboard

## 👥 Built for Hackathon

This project was designed for a college hackathon demonstration. It showcases:

1. ✅ Full-stack development (React + Express + SQLite)
2. ✅ Relational database design with proper foreign keys
3. ✅ RESTful API architecture
4. ✅ Authentication and authorization
5. ✅ CRUD operations across all entities
6. ✅ Data visualization with charts
7. ✅ Responsive design
8. ✅ Complete demo data for immediate usability
9. ✅ Clean, organized codebase
10. ✅ Error handling throughout

---

**GlobeTrotter** — Empowering Personalized Travel Planning 🌍✈️
