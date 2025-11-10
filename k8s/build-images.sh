#!/bin/bash

echo "🔨 Building Docker images for Kubernetes..."

# Use minikube's Docker daemon
eval $(minikube docker-env)

# Build backend image
echo "📦 Building backend image..."
cd ../backend
docker build -t chat-app/backend:latest .

# Build frontend image
echo "📦 Building frontend image..."
cd ../frontend
docker build -t chat-app/frontend:latest .

echo ""
echo "✅ Images built successfully!"
echo ""
echo "📋 Verify images:"
docker images | grep chat-app