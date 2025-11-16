#!/bin/bash
set -e

echo "🚀 Full Kubernetes Deployment for Chat App"
echo "==========================================="

# Step 1: Start Kubernetes
echo ""
echo "Step 1: Starting Kubernetes cluster..."
./start-k8s.sh

# Step 2: Deploy application
echo ""
echo "Step 2: Deploying application..."
./deploy.sh

# Step 3: Wait for pods
echo ""
echo "Step 3: Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod --all -n chat-app --timeout=300s

# Step 4: Show status
echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Current Status:"
kubectl get all -n chat-app

echo ""
echo "🌐 Access your application:"
echo "  NodePort: http://$(minikube ip):30080"
echo "  Or run: minikube service frontend-nodeport -n chat-app"
echo ""
echo "📝 Useful commands:"
echo "  Logs: kubectl logs -f deployment/backend -n chat-app"
echo "  Pods: kubectl get pods -n chat-app"
echo "  Services: kubectl get svc -n chat-app"
