# 🔧 Kubernetes Troubleshooting Guide

## Common Issues

### 1. Docker Not Running
**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# Start Docker Desktop application
open -a Docker
# Wait 30 seconds, then retry
```

### 2. Minikube Won't Start
**Error**: `Exiting due to PROVIDER_DOCKER_NOT_RUNNING`

**Solution**:
```bash
# Delete existing cluster
minikube delete

# Start fresh
minikube start --driver=docker --cpus=4 --memory=8192
```

### 3. Pods Not Starting
**Check status**:
```bash
kubectl get pods -n chat-app
kubectl describe pod <pod-name> -n chat-app
```

**Common fixes**:
```bash
# Image pull issues - rebuild images
eval $(minikube docker-env)
cd .. && docker build -t chat-app/backend:latest ./backend
cd .. && docker build -t chat-app/frontend:latest ./frontend

# Restart deployment
kubectl rollout restart deployment/backend -n chat-app
```

### 4. Can't Access Application
**Check services**:
```bash
kubectl get svc -n chat-app
minikube service list -n chat-app
```

**Access via NodePort**:
```bash
minikube service frontend-nodeport -n chat-app
```

### 5. Database Connection Issues
**Check MongoDB**:
```bash
kubectl logs statefulset/mongodb -n chat-app
kubectl exec -it mongodb-0 -n chat-app -- mongosh
```

## Quick Commands

```bash
# View all resources
kubectl get all -n chat-app

# Check logs
kubectl logs -f deployment/backend -n chat-app
kubectl logs -f deployment/frontend -n chat-app

# Restart everything
kubectl rollout restart deployment --all -n chat-app

# Delete and redeploy
kubectl delete namespace chat-app
./deploy.sh

# Stop cluster
minikube stop

# Delete cluster
minikube delete
```

## Performance Issues

```bash
# Check resource usage
kubectl top pods -n chat-app
kubectl top nodes

# Scale manually
kubectl scale deployment backend --replicas=5 -n chat-app

# Check HPA
kubectl get hpa -n chat-app
kubectl describe hpa backend-hpa -n chat-app
```
