#!/bin/bash
set -e

echo "🚀 Starting Kubernetes cluster..."

# Check if minikube is already running
if minikube status &>/dev/null; then
    echo "✅ Minikube is already running"
else
    echo "📦 Starting minikube..."
    minikube start --driver=docker --cpus=4 --memory=8192
fi

# Enable ingress addon
echo "🌐 Enabling ingress..."
minikube addons enable ingress

# Enable metrics server for HPA
echo "📊 Enabling metrics-server..."
minikube addons enable metrics-server

# Build images in minikube's docker
echo "🔨 Building Docker images..."
eval $(minikube docker-env)
cd ..
docker build -t chat-app/backend:latest ./backend
docker build -t chat-app/frontend:latest ./frontend

echo ""
echo "✅ Kubernetes cluster ready!"
echo "📋 Cluster info:"
kubectl cluster-info
echo ""
echo "🎯 Next steps:"
echo "  1. Deploy: cd k8s && ./deploy.sh"
echo "  2. Or use Helm: ./deploy-helm.sh"
echo "  3. Or use Kustomize: ./deploy-kustomize.sh development"
