#!/bin/bash

echo "🚀 Starting Chat App (Local Mode)..."

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env file not found!"
    exit 1
fi

# Start backend
echo "🔧 Starting Backend on port 5001..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "🌐 Backend API: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for Ctrl+C
wait $BACKEND_PID
