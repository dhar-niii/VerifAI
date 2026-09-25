#!/bin/bash
# GlobeTrotter - Start both backend and frontend
echo "🌍 Starting GlobeTrotter..."
echo ""

# Start backend in background
echo "📦 Starting backend on port 5000..."
cd backend && node server.js &
BACKEND_PID=$!

# Start frontend
echo "📦 Starting frontend on port 3000..."
cd ../frontend && npx vite &
FRONTEND_PID=$!

echo ""
echo "✅ GlobeTrotter is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Demo:     demo@globetrotter.com / demo123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Trap to kill both on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
