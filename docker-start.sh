#!/bin/bash

# Chat App Docker Startup Script
echo "🚀 Starting Chat App with Docker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your actual credentials"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Chat App is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5001"
echo "🗄️  MongoDB: localhost:27017"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📋 Useful commands:"
echo "  docker compose logs -f          # View logs"
echo "  docker compose down             # Stop services"
echo "  docker compose down -v          # Stop and remove volumes"