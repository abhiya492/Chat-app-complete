# 🚀 Quick Access Guide

## ✅ Everything is Running!

Your complete DevOps stack is deployed:
- ✅ Kubernetes Cluster (Minikube)
- ✅ Chat Application (Backend + Frontend + DB)
- ✅ ArgoCD (GitOps)
- ✅ Prometheus + Grafana (Monitoring)

---

## 🎯 Access Your Services

### **Option 1: Interactive Menu**
```bash
./access-dashboards.sh
```

### **Option 2: Direct Commands**

#### **ArgoCD (GitOps Dashboard)**
```bash
# Terminal 1
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Open: https://localhost:8080
# Username: admin
# Password: Run this to get it:
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

#### **Grafana (Monitoring Dashboard)**
```bash
# Terminal 2
kubectl port-forward svc/prometheus-grafana -n monitoring 3001:80

# Open: http://localhost:3001
# Username: admin
# Password: admin
```

#### **Prometheus (Metrics)**
```bash
# Terminal 3
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090

# Open: http://localhost:9090
```

#### **Chat Application**
```bash
minikube service frontend-nodeport -n chat-app
# Or: http://192.168.49.2:30080
```

---

## 📊 Check Status

```bash
# All pods
kubectl get pods --all-namespaces

# Chat app
kubectl get pods -n chat-app

# ArgoCD
kubectl get pods -n argocd

# Monitoring
kubectl get pods -n monitoring

# Services
kubectl get svc -n chat-app
```

---

## 🔄 CI/CD Workflow

### **Trigger Deployment**
```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# Watch in GitHub Actions:
# https://github.com/abhiya492/Chat-app-complete/actions

# Watch in ArgoCD:
# https://localhost:8080
```

---

## 📈 Grafana Dashboards

Once in Grafana (http://localhost:3000):

1. **Kubernetes / Compute Resources / Cluster**
   - Overall cluster metrics
   - CPU, Memory, Network

2. **Kubernetes / Compute Resources / Namespace (Pods)**
   - Select namespace: `chat-app`
   - Pod-level metrics

3. **Kubernetes / Compute Resources / Pod**
   - Select pod: `backend-*` or `frontend-*`
   - Container metrics

---

## 🎯 Common Tasks

### **Scale Application**
```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n chat-app

# Check HPA
kubectl get hpa -n chat-app
```

### **View Logs**
```bash
# Backend logs
kubectl logs -f deployment/backend -n chat-app

# Frontend logs
kubectl logs -f deployment/frontend -n chat-app

# All backend pods
kubectl logs -f -l app=backend -n chat-app
```

### **Restart Deployment**
```bash
kubectl rollout restart deployment/backend -n chat-app
kubectl rollout restart deployment/frontend -n chat-app
```

### **Check ArgoCD Apps**
```bash
kubectl get applications -n argocd
```

---

## 🛠️ Makefile Commands

```bash
make help                  # Show all commands
make k8s-status           # Check K8s status
make argocd-ui            # Open ArgoCD
make grafana-ui           # Open Grafana
make ci-test              # Run tests locally
make clean                # Clean up everything
```

---

## 🎉 What You Have

### **Infrastructure**
- ✅ Kubernetes cluster (Minikube)
- ✅ 3 Backend pods (auto-scaling 2-10)
- ✅ 2 Frontend pods (auto-scaling 2-5)
- ✅ MongoDB (persistent storage)
- ✅ Redis (persistent storage)

### **CI/CD**
- ✅ GitHub Actions (automated builds)
- ✅ ArgoCD (GitOps deployments)
- ✅ Security scanning (Trivy)
- ✅ Multi-environment (dev/prod)

### **Monitoring**
- ✅ Prometheus (metrics collection)
- ✅ Grafana (dashboards)
- ✅ Node exporter (system metrics)
- ✅ Kube-state-metrics (K8s metrics)

---

## 🚀 Next Steps

1. **Access ArgoCD**: `./access-dashboards.sh` → Choose 1
2. **Access Grafana**: `./access-dashboards.sh` → Choose 2
3. **Test Chat App**: `./access-dashboards.sh` → Choose 4
4. **Push Code**: Trigger CI/CD pipeline
5. **Monitor**: Watch metrics in Grafana

---

## 📚 Documentation

- **Full CI/CD Guide**: [CICD.md](./CICD.md)
- **DevOps Setup**: [DEVOPS_SETUP.md](./DEVOPS_SETUP.md)
- **Complete Summary**: [DEVOPS_COMPLETE.md](./DEVOPS_COMPLETE.md)
- **Kubernetes Guide**: [KUBERNETES.md](./KUBERNETES.md)
- **Troubleshooting**: [k8s/TROUBLESHOOTING.md](./k8s/TROUBLESHOOTING.md)

---

## 🎯 Quick Start

```bash
# Access everything
./access-dashboards.sh

# Or use Makefile
make argocd-ui    # Terminal 1
make grafana-ui   # Terminal 2
```

**You're all set! 🚀**
