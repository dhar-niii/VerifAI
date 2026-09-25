#!/bin/bash
# GlobeTrotter - One-click setup and start
# Run this script from the project root

echo "🌍 GlobeTrotter Setup"
echo "===================="

# Check for node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Seed database
echo ""
echo "🌱 Seeding database with demo data..."
node database/seed.js

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the app, run:"
echo "   Terminal 1 (Backend):  cd backend && npm start"
echo "   Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
echo "📝 Then open http://localhost:3000"
echo ""
echo "🔐 Demo credentials:"
echo "   Email: demo@globetrotter.com"
echo "   Password: demo123"
