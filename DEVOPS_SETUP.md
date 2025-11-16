# 🚀 Complete DevOps Setup Guide

## ✅ What's Implemented

### CI/CD Pipeline
- ✅ GitHub Actions (CI)
  - Backend testing & building
  - Frontend testing & building
  - Security scanning (Trivy)
  - Automated Docker image push
- ✅ ArgoCD (GitOps CD)
  - Auto-sync deployments
  - Multi-environment (dev/prod)
  - Self-healing
- ✅ Monitoring
  - Prometheus (metrics)
  - Grafana (dashboards)
  - AlertManager (alerts)

## 🎯 Quick Start (5 Minutes)

### Step 1: Install ArgoCD
```bash
make argocd-install
```

### Step 2: Install Monitoring
```bash
make monitoring-install
```

### Step 3: Configure GitHub Secrets
1. Go to: `https://github.com/abhiya492/Chat-app-complete/settings/secrets/actions`
2. Add secret: `KUBECONFIG`
   ```bash
   cat ~/.kube/config | base64 | pbcopy
   ```
   Paste the copied value

### Step 4: Push Code to Trigger CI/CD
```bash
git add .
git commit -m "feat: setup CI/CD pipeline"
git push origin main
```

## 📊 Access Dashboards

### ArgoCD UI
```bash
make argocd-ui
# Open: https://localhost:8080
# Username: admin
# Password: (shown in terminal)
```

### Grafana UI
```bash
make grafana-ui
# Open: http://localhost:3000
# Username: admin
# Password: admin
```

### Prometheus UI
```bash
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
# Open: http://localhost:9090
```

## 🔄 CI/CD Flow

```
1. Developer pushes code
   ↓
2. GitHub Actions runs
   - Tests
   - Security scan
   - Build Docker image
   - Push to GHCR
   ↓
3. ArgoCD detects change
   - Syncs K8s manifests
   - Deploys to cluster
   ↓
4. Monitoring tracks
   - Pod health
   - Metrics
   - Alerts
```

## 📁 Project Structure

```
Chat-app-complete/
├── .github/workflows/       # CI/CD pipelines
│   ├── ci-backend.yml
│   ├── ci-frontend.yml
│   ├── cd-deploy.yml
│   └── security-scan.yml
├── argocd/                  # GitOps config
│   ├── application.yaml
│   └── install.sh
├── monitoring/              # Observability
│   ├── prometheus-values.yaml
│   └── install.sh
├── k8s/                     # Kubernetes manifests
│   ├── base/
│   ├── overlays/
│   └── helm/
├── Makefile                 # DevOps commands
├── CICD.md                  # Full CI/CD docs
└── DEVOPS_SETUP.md         # This file
```

## 🛠️ Useful Commands

```bash
# Kubernetes
make k8s-start              # Start cluster
make k8s-deploy             # Deploy app
make k8s-status             # Check status

# CI/CD
make argocd-install         # Install ArgoCD
make argocd-ui              # Open ArgoCD
make monitoring-install     # Install monitoring
make grafana-ui             # Open Grafana

# Development
make ci-test                # Run tests locally
make build                  # Build images
make clean                  # Clean up
```

## 🎯 Production Deployment

### Option 1: GitHub Actions (Automated)
```bash
# Push to main branch
git push origin main

# Or manually trigger
# Go to: Actions → CD - Deploy to Kubernetes → Run workflow
```

### Option 2: ArgoCD (GitOps)
```bash
# Apply ArgoCD application
kubectl apply -f argocd/application.yaml

# ArgoCD will auto-sync from Git
# View in UI: https://localhost:8080
```

### Option 3: Helm (Manual)
```bash
cd k8s
bash deploy-helm.sh chat-app production
```

## 📈 Monitoring & Alerts

### View Metrics
```bash
# Grafana dashboards
make grafana-ui

# Prometheus queries
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
```

### Check Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n chat-app

# Frontend logs
kubectl logs -f deployment/frontend -n chat-app

# All pods
kubectl logs -f -l app=backend -n chat-app
```

## 🔒 Security

### Vulnerability Scanning
- Automated with Trivy in CI pipeline
- Weekly scheduled scans
- Results in GitHub Security tab

### Manual Scan
```bash
# Scan filesystem
trivy fs .

# Scan Docker image
trivy image chat-app/backend:latest
```

## 🚨 Troubleshooting

### CI Pipeline Fails
```bash
# Check GitHub Actions logs
# Go to: Actions tab in GitHub

# Run tests locally
make ci-test
```

### ArgoCD Not Syncing
```bash
# Check ArgoCD status
kubectl get applications -n argocd

# Force sync
kubectl patch application chat-app-dev -n argocd --type merge -p '{"operation":{"sync":{"revision":"HEAD"}}}'
```

### Monitoring Issues
```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
# Visit: http://localhost:9090/targets

# Restart Grafana
kubectl rollout restart deployment/prometheus-grafana -n monitoring
```

## 📚 Documentation

- **Full CI/CD Guide**: [CICD.md](./CICD.md)
- **Kubernetes Guide**: [KUBERNETES.md](./KUBERNETES.md)
- **Troubleshooting**: [k8s/TROUBLESHOOTING.md](./k8s/TROUBLESHOOTING.md)

## ✅ Checklist

- [x] Kubernetes cluster running
- [x] Application deployed
- [ ] ArgoCD installed
- [ ] Monitoring installed
- [ ] GitHub secrets configured
- [ ] CI/CD pipeline tested
- [ ] Dashboards accessible

## 🎉 You're Done!

Your complete DevOps pipeline is ready:
- ✅ CI/CD with GitHub Actions
- ✅ GitOps with ArgoCD
- ✅ Monitoring with Prometheus + Grafana
- ✅ Security scanning with Trivy
- ✅ Multi-environment deployments
- ✅ Auto-scaling enabled

**Next**: Push code and watch it deploy automatically! 🚀
