#!/bin/bash
set -e

ENV=${1:-development}

echo "🚀 Deploying Chat App with Kustomize ($ENV)..."

if [[ "$ENV" != "development" && "$ENV" != "production" ]]; then
    echo "❌ Invalid environment. Use: development or production"
    exit 1
fi

kubectl apply -k overlays/$ENV

echo "✅ Deployment complete!"
kubectl get pods -n chat-app-${ENV:0:4}
