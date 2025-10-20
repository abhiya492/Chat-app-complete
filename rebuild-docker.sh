#!/bin/bash
echo "Stopping containers..."
docker-compose down

echo "Rebuilding containers..."
docker-compose build --no-cache

echo "Starting containers..."
docker-compose up -d

echo "Done! Check logs with: docker-compose logs -f"
