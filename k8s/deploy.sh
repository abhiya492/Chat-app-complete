#!/bin/bash

# Kubernetes Deployment Script for Chat App
set -e

echo "🚀 Deploying Chat App to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

# Create namespace
echo "📦 Creating namespace..."
kubectl create namespace chat-app --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMaps and Secrets
echo "🔧 Applying ConfigMaps and Secrets..."
kubectl apply -f base/configmap.yaml -n chat-app
kubectl apply -f base/mongodb-init-configmap.yaml -n chat-app
kubectl apply -f base/secrets.yaml -n chat-app

# Apply Persistent Volumes
echo "💾 Creating Persistent Volumes..."
kubectl apply -f base/persistent-volumes.yaml -n chat-app

# Deploy StatefulSets (Databases)
echo "🗄️ Deploying Databases..."
kubectl apply -f base/mongodb-statefulset.yaml -n chat-app
kubectl apply -f base/redis-statefulset.yaml -n chat-app

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n chat-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n chat-app --timeout=300s

# Deploy Applications
echo "🚀 Deploying Applications..."
kubectl apply -f base/backend-deployment.yaml -n chat-app
kubectl apply -f base/frontend-deployment.yaml -n chat-app

# Apply Services
echo "🌐 Creating Services..."
kubectl apply -f base/services.yaml -n chat-app

# Apply Ingress
echo "🚪 Setting up Ingress..."
kubectl apply -f base/ingress.yaml -n chat-app

# Apply HPA
echo "📈 Setting up Auto-scaling..."
kubectl apply -f base/hpa.yaml -n chat-app

# Apply Network Policies
echo "🔒 Applying Network Policies..."
kubectl apply -f base/network-policies.yaml -n chat-app

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/backend -n chat-app --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n chat-app --timeout=300s

echo ""
echo "✅ Chat App deployed successfully!"
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n chat-app
echo ""
echo "🌐 Services:"
kubectl get services -n chat-app
echo ""
echo "🚪 Ingress:"
kubectl get ingress -n chat-app
echo ""
echo "📈 HPA Status:"
kubectl get hpa -n chat-app
echo ""
echo "🔗 Access your app:"
echo "  Local: http://chat-app.local (add to /etc/hosts)"
echo "  NodePort: http://localhost:30080"