#!/bin/bash

echo "🎮 Setting up Local Kubernetes Playground..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install kubectl
if ! command -v kubectl &> /dev/null; then
    echo "📦 Installing kubectl..."
    brew install kubectl
else
    echo "✅ kubectl already installed"
fi

# Install minikube
if ! command -v minikube &> /dev/null; then
    echo "📦 Installing minikube..."
    brew install minikube
else
    echo "✅ minikube already installed"
fi

# Install helm
if ! command -v helm &> /dev/null; then
    echo "📦 Installing helm..."
    brew install helm
else
    echo "✅ helm already installed"
fi

echo ""
echo "✅ All tools installed!"
echo ""
echo "🚀 Next steps:"
echo "  1. Start cluster: minikube start --cpus=4 --memory=8192"
echo "  2. Enable addons: minikube addons enable ingress metrics-server"
echo "  3. Build images: ./build-images.sh"
echo "  4. Deploy app: ./deploy.sh"