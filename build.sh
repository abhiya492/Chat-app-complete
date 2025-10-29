#!/bin/bash

# Build script for deployment
echo "Building frontend..."
cd frontend
npm ci
npm run build

echo "Installing backend dependencies..."
cd ../backend
npm ci

echo "Build complete!"