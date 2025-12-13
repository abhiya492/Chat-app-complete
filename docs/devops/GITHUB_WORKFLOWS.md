# 🔄 GitHub Workflows Documentation

This document explains the CI/CD workflows configured for the Chat App.

## 📋 Available Workflows

### CI Workflows
- **ci-backend.yml** - Backend continuous integration
- **ci-frontend.yml** - Frontend continuous integration
- **security-scan.yml** - Security vulnerability scanning

### CD Workflows
- **deploy-pipeline.yml** - Deployment pipeline
- **cd-deploy.yml.disabled** - Disabled deployment workflow

### K8s Documentation
- **DEPLOYMENT_SUMMARY.md** - Kubernetes deployment summary
- **QUICKSTART.md** - K8s quick start guide
- **TROUBLESHOOTING.md** - K8s troubleshooting guide

## 🎯 Workflow Features

### Backend CI (ci-backend.yml)
- Node.js testing
- Dependency security audit
- Code quality checks
- Docker image building

### Frontend CI (ci-frontend.yml)
- React build testing
- ESLint code quality
- Bundle size analysis
- Docker image building

### Security Scan (security-scan.yml)
- Dependency vulnerability scanning
- Code security analysis
- SAST (Static Application Security Testing)

### Deploy Pipeline (deploy-pipeline.yml)
- Automated deployment
- Environment promotion
- Rollback capabilities
- Health checks

## 🛠️ Setup Instructions

1. **Enable workflows** in GitHub repository settings
2. **Configure secrets** for deployment credentials
3. **Set up environments** (dev, staging, prod)
4. **Configure branch protection** rules

## 🔐 Required Secrets

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password
- `KUBE_CONFIG` - Kubernetes configuration
- `DEPLOY_KEY` - SSH deployment key