#!/bin/bash

echo "🔍 Pre-flight Checks for Kubernetes Deployment"
echo "=============================================="

# Check Docker
echo -n "Docker: "
if docker info &>/dev/null; then
    echo "✅ Running"
else
    echo "❌ Not running"
    echo "   → Start Docker Desktop and try again"
    exit 1
fi

# Check minikube
echo -n "Minikube: "
if command -v minikube &>/dev/null; then
    echo "✅ Installed ($(minikube version --short))"
else
    echo "❌ Not installed"
    echo "   → Run: brew install minikube"
    exit 1
fi

# Check kubectl
echo -n "kubectl: "
if command -v kubectl &>/dev/null; then
    echo "✅ Installed"
else
    echo "❌ Not installed"
    echo "   → Run: brew install kubectl"
    exit 1
fi

echo ""
echo "✅ All checks passed! Ready to deploy."
echo ""
echo "🚀 Run: ./full-deploy.sh"
