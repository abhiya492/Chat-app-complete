# 🚀 CI/CD Pipeline Documentation

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── Push to branch
             │
┌────────────▼────────────────────────────────────────────────┐
│                    GitHub Actions (CI)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Test   │→ │ Security │→ │  Build   │→ │   Push   │   │
│  │          │  │   Scan   │  │  Docker  │  │  to GHCR │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── Image pushed
             │
┌────────────▼────────────────────────────────────────────────┐
│                    ArgoCD (GitOps CD)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Detect  │→ │   Sync   │→ │  Deploy  │                  │
│  │  Change  │  │   Repo   │  │   to K8s │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── Deployed
             │
┌────────────▼────────────────────────────────────────────────┐
│                  Kubernetes Cluster                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Backend  │  │ Frontend │  │ Database │                  │
│  │  Pods    │  │  Pods    │  │  Pods    │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─── Metrics
             │
┌────────────▼────────────────────────────────────────────────┐
│              Prometheus + Grafana (Monitoring)               │
└──────────────────────────────────────────────────────────────┘
```

## 🛠️ Tools Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| **CI** | GitHub Actions | Build, test, security scan |
| **CD** | ArgoCD | GitOps deployment |
| **Registry** | GitHub Container Registry | Docker images |
| **Security** | Trivy | Vulnerability scanning |
| **Monitoring** | Prometheus + Grafana | Metrics & dashboards |
| **K8s** | Minikube/EKS/GKE | Container orchestration |

## 📁 CI/CD Files

```
.github/workflows/
├── ci-backend.yml       # Backend CI pipeline
├── ci-frontend.yml      # Frontend CI pipeline
├── cd-deploy.yml        # Deployment pipeline
└── security-scan.yml    # Security scanning

argocd/
├── application.yaml     # ArgoCD app definitions
└── install.sh          # ArgoCD setup script

monitoring/
├── prometheus-values.yaml
└── install.sh          # Monitoring setup
```

## 🚀 Setup Instructions

### 1. GitHub Actions (CI)

**Already configured!** Workflows will run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`

**Required Secrets** (Add in GitHub repo settings):
```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Description | Required For |
|--------|-------------|--------------|
| `KUBECONFIG` | Base64 encoded kubeconfig | CD deployment |
| `GITHUB_TOKEN` | Auto-provided | Image push to GHCR |

**Get KUBECONFIG**:
```bash
cat ~/.kube/config | base64
```

### 2. ArgoCD (GitOps CD)

**Install ArgoCD**:
```bash
cd argocd
bash install.sh
```

**Access ArgoCD UI**:
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
Open: https://localhost:8080
- Username: `admin`
- Password: (shown after install)

**Deploy Chat App**:
```bash
kubectl apply -f argocd/application.yaml
```

### 3. Monitoring (Prometheus + Grafana)

**Install Monitoring Stack**:
```bash
cd monitoring
bash install.sh
```

**Access Grafana**:
```bash
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80
```
Open: http://localhost:3000
- Username: `admin`
- Password: `admin`

## 🔄 CI/CD Workflow

### Development Flow

1. **Developer pushes code** to `develop` branch
2. **GitHub Actions** triggers:
   - Run tests
   - Security scan with Trivy
   - Build Docker images
   - Push to GHCR with tag `develop-<sha>`
3. **ArgoCD** detects change:
   - Auto-syncs to `chat-app-dev` namespace
   - Deploys to development cluster
4. **Monitoring** tracks:
   - Pod health
   - Resource usage
   - Application metrics

### Production Flow

1. **Merge PR** to `main` branch
2. **GitHub Actions** triggers:
   - Full test suite
   - Security scan
   - Build production images
   - Push to GHCR with tag `main-<sha>`
3. **ArgoCD** (manual approval):
   - Review changes in UI
   - Click "Sync" to deploy
   - Deploys to `chat-app-prod` namespace
4. **Monitoring** alerts on issues

## 📊 Pipeline Features

### CI Pipeline
- ✅ Automated testing
- ✅ Code linting
- ✅ Security vulnerability scanning
- ✅ Docker image building
- ✅ Multi-stage builds (optimized)
- ✅ Layer caching (faster builds)
- ✅ Automatic versioning (SHA tags)

### CD Pipeline
- ✅ GitOps (declarative)
- ✅ Auto-sync to K8s
- ✅ Self-healing
- ✅ Rollback capability
- ✅ Multi-environment (dev/prod)
- ✅ Health checks
- ✅ Progressive delivery

### Security
- ✅ Trivy vulnerability scanning
- ✅ Dependency audits
- ✅ SARIF reports to GitHub Security
- ✅ Weekly scheduled scans
- ✅ Image signing (optional)

## 🎯 Usage Examples

### Trigger CI Pipeline
```bash
# Push to trigger CI
git add .
git commit -m "feat: add new feature"
git push origin develop
```

### Manual Deployment
```bash
# Via GitHub Actions UI
Actions → CD - Deploy to Kubernetes → Run workflow
Select environment: development/production
```

### Check ArgoCD Status
```bash
# CLI
kubectl get applications -n argocd

# UI
https://localhost:8080
```

### View Metrics
```bash
# Grafana
kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80

# Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
```

## 🔧 Troubleshooting

### CI Pipeline Fails
```bash
# Check workflow logs in GitHub Actions tab
# Common issues:
# - Test failures: Fix tests
# - Build errors: Check Dockerfile
# - Security issues: Update dependencies
```

### ArgoCD Not Syncing
```bash
# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-application-controller

# Force sync
kubectl patch application chat-app-dev -n argocd --type merge -p '{"operation":{"initiatedBy":{"username":"admin"},"sync":{"revision":"HEAD"}}}'
```

### Monitoring Not Working
```bash
# Check Prometheus targets
kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
# Open: http://localhost:9090/targets

# Restart Grafana
kubectl rollout restart deployment/prometheus-grafana -n monitoring
```

## 📈 Best Practices

1. **Branch Strategy**:
   - `main` → Production
   - `develop` → Development
   - `feature/*` → Feature branches

2. **Versioning**:
   - Use semantic versioning for releases
   - Tag images with git SHA for traceability

3. **Security**:
   - Scan images before deployment
   - Keep dependencies updated
   - Use secrets management

4. **Monitoring**:
   - Set up alerts for critical metrics
   - Monitor resource usage
   - Track deployment success rate

5. **Rollback**:
   - Keep previous versions
   - Test rollback procedures
   - Document rollback steps

## 🚀 Next Steps

1. ✅ CI/CD pipelines configured
2. ⏭️ Install ArgoCD: `cd argocd && bash install.sh`
3. ⏭️ Install Monitoring: `cd monitoring && bash install.sh`
4. ⏭️ Push code to trigger pipeline
5. ⏭️ Monitor deployment in ArgoCD UI
6. ⏭️ View metrics in Grafana

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [ArgoCD Docs](https://argo-cd.readthedocs.io/)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Trivy Docs](https://aquasecurity.github.io/trivy/)
