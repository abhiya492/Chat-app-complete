#!/bin/bash
set -e

RELEASE_NAME=${1:-chat-app}
NAMESPACE=${2:-default}

echo "🚀 Deploying Chat App with Helm..."

helm upgrade --install $RELEASE_NAME ./helm/chat-app \
  --namespace $NAMESPACE \
  --create-namespace \
  --wait \
  --timeout 10m

echo "✅ Deployment complete!"
helm status $RELEASE_NAME -n $NAMESPACE
kubectl get pods -n $NAMESPACE
