# 🌍 GlobeTrotter — Empowering Personalized Travel Planning

> A full-stack travel planning platform that lets you create, organize, visualize, budget, and share multi-city trips.

## 📋 Problem Statement

Planning multi-city trips is tedious — juggling multiple tabs, spreadsheets, and notes to track destinations, activities, budgets, and schedules. GlobeTrotter brings everything into one beautiful, interactive platform.

## ✨ Features

- **Multi-City Itinerary Builder** — Create detailed itineraries with stops across multiple cities
- **Activity Discovery** — Browse and add curated activities (sightseeing, food, adventure, culture, etc.)
- **Budget Tracker** — Track expenses by category with pie charts and bar graphs
- **Calendar/Timeline View** — See your trip unfold day by day
- **City Explorer** — Search and filter cities by region, popularity, and cost level
- **Trip Sharing** — Share itineraries publicly with a read-only link
- **Profile & Settings** — Manage your name, language, and preferences
- **Responsive Design** — Works beautifully on desktop and mobile
- **Demo Data** — Pre-seeded with 15 cities and 40+ activities

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| UI Components | shadcn/ui, Lucide icons, Framer Motion |
| Charts | Recharts |
| Backend/Database | Convex (reactive serverless database) |
| Auth | Convex Auth (Email OTP + Anonymous) |
| Routing | React Router v7 |
| State | Convex reactive queries |

## 🏗 Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AppLayout.tsx   # Sidebar navigation layout
│   ├── Seeder.tsx      # Auto-seeds demo data
│   └── RequireAuth.tsx # Auth guard
├── convex/             # Backend (Convex functions)
│   ├── schema.ts       # Database schema
│   ├── seed.ts         # Seed data
│   ├── trips.ts        # Trip CRUD
│   ├── stops.ts        # Trip stops CRUD
│   ├── tripActivities.ts # Activity-to-stop mapping
│   ├── activities.ts   # Activity search
│   ├── cities.ts       # City search
│   ├── expenses.ts     # Expense tracking
│   └── profile.ts      # User profile
├── pages/              # Route pages
│   ├── Landing.tsx     # Public landing page
│   ├── Auth.tsx        # Authentication
│   ├── Dashboard.tsx   # Main dashboard
│   ├── CreateTrip.tsx  # Create new trip
│   ├── MyTrips.tsx     # Trip management
│   ├── ItineraryBuilder.tsx # Core itinerary editor
│   ├── CitySearch.tsx  # City discovery
│   ├── ActivitySearch.tsx # Activity discovery
│   ├── Budget.tsx      # Budget tracking with charts
│   ├── CalendarPage.tsx # Day-by-day timeline
│   ├── SharedTrips.tsx # Public shared trips
│   ├── PublicItinerary.tsx # Public read-only view
│   └── Profile.tsx     # User settings
├── hooks/              # Custom React hooks
└── main.tsx            # App entry & routing
```

## 🗄 Database Schema

**Relational structure** using Convex with proper foreign key relationships:

- **users** — User accounts (name, email, language, favorites)
- **cities** — 15 world cities with metadata (region, popularity, cost level)
- **activities** — 40+ activities linked to cities (category, duration, cost)
- **trips** — User trips with dates, budget, and visibility
- **tripStops** — Multi-city stops within trips (ordered)
- **tripActivities** — Activities assigned to specific stops/dates
- **expenses** — Budget tracking by category and city
- **favorites** — User's favorite cities

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) 18+ (or [Bun](https://bun.sh))
- A [Convex](https://convex.dev) account (free tier works)

### Installation

```bash
# Install dependencies
bun install

# Set up Convex (creates your backend)
bunx convex dev
```

### Environment Variables

The app needs one environment variable:
```
VITE_CONVEX_URL=<your-convex-url>
```

This is automatically set by `bunx convex dev`.

### Running

```bash
bun dev
```

The app opens at `http://localhost:5173`. Demo data auto-seeds on first load.

### Demo Credentials

- Use **Guest Login** (anonymous) for instant access
- Or sign up with any email (OTP verification)

## 📊 API Overview

All API calls go through Convex's reactive query/mutation system:

| Function | Type | Description |
|----------|------|-------------|
| `seed.seedData` | Mutation | Seeds cities and activities |
| `trips.create` | Mutation | Create a new trip |
| `trips.update` | Mutation | Update trip details |
| `trips.remove` | Mutation | Delete a trip and related data |
| `trips.list` | Query | List user's trips |
| `trips.listWithDetails` | Query | Trips with stop counts and spending |
| `trips.getPublic` | Query | Public trip for sharing |
| `stops.add` | Mutation | Add a city stop to a trip |
| `stops.listByTrip` | Query | Stops with activities and cities |
| `tripActivities.add` | Mutation | Add activity to a stop |
| `activities.search` | Query | Search activities by text/category/city |
| `cities.search` | Query | Search cities by text/region |
| `expenses.add` | Mutation | Add an expense |
| `expenses.summary` | Query | Budget summary with charts data |
| `profile.update` | Mutation | Update user profile |

## 🎨 Design System

**Theme:** Navy (#1E3A5F), White, Warm Orange (#E07A3A)

- **Primary (Navy):** Headers, sidebar, cards, buttons
- **Accent (Orange):** CTAs, highlights, active states, badges
- **Background:** Light blue-gray (#FAFBFC)
- **Cards:** White with subtle borders

## 🔮 Future Improvements

- Drag-and-drop activity reordering
- Real-time collaboration on shared trips
- Google Maps integration for route visualization
- Hotel/flight booking API integration
- Offline mode with sync
- Multi-language support
- Push notifications for trip reminders

## 📝 License

Built for college hackathon demonstration purposes.

---

**Built with ❤️ using React + Convex + Tailwind CSS**
