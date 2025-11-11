#!/bin/bash

echo "🚀 Starting Chat Application..."
echo ""

# Kill existing processes on ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Check if node_modules exists in backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if node_modules exists in frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🔧 Starting Backend on http://localhost:5001"
echo "🎨 Starting Frontend on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend and frontend concurrently
trap 'kill 0' EXIT
cd backend && npm run dev &
cd frontend && npm run dev &
wait
