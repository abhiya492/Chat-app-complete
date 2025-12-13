# ☸️ Kubernetes Deployment Guide

## Prerequisites

### Required Software
- Docker Desktop (must be running)
- kubectl: `brew install kubectl`
- minikube: `brew install minikube`

### Quick Check
```bash
cd k8s
./preflight-check.sh
```

## 🚀 One-Command Deployment
```bash
cd k8s
./full-deploy.sh
```
This will:
1. Start minikube cluster
2. Build Docker images
3. Deploy all components
4. Show access URLs

## Step-by-Step Deployment

### 1. Start Kubernetes
```bash
cd k8s
./start-k8s.sh
```

### 2. Deploy Application
```bash
./deploy.sh
```

## Manual Deployment Steps
```bash
# 1. Create namespace
kubectl create namespace chat-app

# 2. Apply configurations
kubectl apply -f base/configmap.yaml -n chat-app
kubectl apply -f base/secrets.yaml -n chat-app

# 3. Create storage
kubectl apply -f base/persistent-volumes.yaml -n chat-app

# 4. Deploy databases
kubectl apply -f base/mongodb-statefulset.yaml -n chat-app
kubectl apply -f base/redis-statefulset.yaml -n chat-app

# 5. Deploy applications
kubectl apply -f base/backend-deployment.yaml -n chat-app
kubectl apply -f base/frontend-deployment.yaml -n chat-app

# 6. Create services
kubectl apply -f base/services.yaml -n chat-app

# 7. Setup ingress
kubectl apply -f base/ingress.yaml -n chat-app

# 8. Enable auto-scaling
kubectl apply -f base/hpa.yaml -n chat-app

# 9. Apply security policies
kubectl apply -f base/network-policies.yaml -n chat-app
```

## Helm Deployment
```bash
# Install with Helm
cd k8s/helm
helm install chat-app ./chat-app -n chat-app --create-namespace

# Upgrade
helm upgrade chat-app ./chat-app -n chat-app

# Uninstall
helm uninstall chat-app -n chat-app
```

## Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│                    Ingress Controller                    │
│                  (nginx-ingress)                        │
└─────────────────┬───────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼────┐                 ┌────▼────┐
│Frontend│                 │ Backend │
│(2 pods)│                 │(3 pods) │
└───┬────┘                 └────┬────┘
    │                           │
    └─────────────┬─────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
┌───▼────┐                 ┌────▼────┐
│MongoDB │                 │  Redis  │
│StatefulSet                │StatefulSet
└────────┘                 └─────────┘
```

## Key Features Implemented

### 🚀 **Deployments**
- **Backend**: 3 replicas with health checks
- **Frontend**: 2 replicas with nginx serving

### 🗄️ **StatefulSets**
- **MongoDB**: Persistent storage, initialization scripts
- **Redis**: Persistent storage, append-only mode

### 🌐 **Services**
- **ClusterIP**: Internal communication
- **NodePort**: Development access
- **LoadBalancer**: Production external access

### 🚪 **Ingress**
- **NGINX Controller**: HTTP/HTTPS routing
- **WebSocket Support**: Socket.io compatibility
- **TLS Termination**: SSL/TLS certificates

### 🔧 **Configuration**
- **ConfigMaps**: Non-sensitive configuration
- **Secrets**: Sensitive data (JWT, API keys)
- **Environment Variables**: Runtime configuration

### 💾 **Storage**
- **Persistent Volumes**: Database data persistence
- **Storage Classes**: Dynamic provisioning
- **Volume Claims**: Storage requests

### 📈 **Auto-scaling**
- **HPA**: CPU/Memory based scaling
- **Backend**: 2-10 replicas
- **Frontend**: 2-5 replicas

### 🔒 **Security**
- **Network Policies**: Pod-to-pod communication control
- **Security Contexts**: Non-root containers
- **RBAC**: Role-based access control

### 📦 **Package Management**
- **Helm Charts**: Templated deployments
- **Values**: Environment-specific configuration
- **Dependencies**: External chart integration

## Monitoring & Troubleshooting
```bash
# Check pod status
kubectl get pods -n chat-app

# View logs
kubectl logs -f deployment/backend -n chat-app
kubectl logs -f deployment/frontend -n chat-app

# Check services
kubectl get services -n chat-app

# Check ingress
kubectl get ingress -n chat-app

# Check HPA status
kubectl get hpa -n chat-app

# Describe resources
kubectl describe pod <pod-name> -n chat-app

# Port forward for debugging
kubectl port-forward service/backend-service 5001:5001 -n chat-app
kubectl port-forward service/frontend-service 3000:80 -n chat-app
```

## Scaling Operations
```bash
# Manual scaling
kubectl scale deployment backend --replicas=5 -n chat-app

# Check HPA metrics
kubectl top pods -n chat-app

# Update resource limits
kubectl patch deployment backend -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"cpu":"1000m"}}}]}}}}' -n chat-app
```

## Production Considerations
- Use managed Kubernetes (EKS, GKE, AKS)
- Implement proper monitoring (Prometheus/Grafana)
- Set up logging (ELK stack)
- Configure backup strategies
- Implement GitOps workflows
- Use proper secrets management (Vault)
- Set up disaster recovery