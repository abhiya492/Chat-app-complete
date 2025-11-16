# Kubernetes Deployment Guide

## 📋 Overview

Complete Kubernetes setup with:
- ✅ Base manifests (production-ready)
- ✅ Kustomize overlays (dev/prod)
- ✅ Helm charts (templated deployment)
- ✅ Auto-scaling (HPA)
- ✅ Network policies
- ✅ Secrets management

## 🚀 Quick Start

### Option 1: Base Manifests
```bash
./deploy.sh
```

### Option 2: Kustomize
```bash
# Development
./deploy-kustomize.sh development

# Production
./deploy-kustomize.sh production
```

### Option 3: Helm
```bash
# Default
./deploy-helm.sh

# Custom
./deploy-helm.sh my-release my-namespace
```

## 📁 Structure

```
k8s/
├── base/                    # Base manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── mongodb-statefulset.yaml
│   ├── redis-statefulset.yaml
│   ├── services.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── secrets.yaml
│   └── configmap.yaml
├── overlays/               # Kustomize overlays
│   ├── development/
│   │   └── kustomization.yaml
│   └── production/
│       └── kustomization.yaml
└── helm/                   # Helm charts
    └── chat-app/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
```

## 🔧 Configuration

### Secrets (Update before deployment)
Edit `base/secrets.yaml` or `helm/chat-app/values.yaml`:
- JWT_SECRET
- Cloudinary credentials
- Email credentials
- OAuth credentials (Google/GitHub)
- Groq API key

### Environment-specific
- **Development**: 1 replica, debug logging
- **Production**: 5 backend, 3 frontend replicas, optimized resources

## 📊 Features

| Feature | Base | Kustomize | Helm |
|---------|------|-----------|------|
| Deployments | ✅ | ✅ | ✅ |
| StatefulSets | ✅ | ✅ | ✅ |
| Auto-scaling | ✅ | ✅ | ✅ |
| Network Policies | ✅ | ✅ | ❌ |
| Multi-env | ❌ | ✅ | ✅ |
| Templating | ❌ | ⚠️ | ✅ |

## 🎯 Access

```bash
# Local (minikube)
minikube service frontend-nodeport -n chat-app

# Ingress
echo "127.0.0.1 chat-app.local" | sudo tee -a /etc/hosts
open http://chat-app.local
```

## 🔍 Monitoring

```bash
# Pods
kubectl get pods -n chat-app

# Logs
kubectl logs -f deployment/backend -n chat-app

# HPA status
kubectl get hpa -n chat-app

# Resources
kubectl top pods -n chat-app
```

## 🧹 Cleanup

```bash
# Base
kubectl delete namespace chat-app

# Kustomize
kubectl delete -k overlays/development

# Helm
helm uninstall chat-app -n default
```
