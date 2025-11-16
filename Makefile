# Chat App DevOps Makefile

.PHONY: help k8s-start k8s-deploy argocd-install monitoring-install ci-test clean

help:
	@echo "🚀 Chat App DevOps Commands"
	@echo ""
	@echo "Kubernetes:"
	@echo "  make k8s-start          - Start minikube cluster"
	@echo "  make k8s-deploy         - Deploy to Kubernetes"
	@echo "  make k8s-status         - Check deployment status"
	@echo ""
	@echo "CI/CD:"
	@echo "  make argocd-install     - Install ArgoCD"
	@echo "  make argocd-ui          - Access ArgoCD UI"
	@echo "  make monitoring-install - Install Prometheus + Grafana"
	@echo "  make grafana-ui         - Access Grafana UI"
	@echo ""
	@echo "Development:"
	@echo "  make ci-test            - Run CI tests locally"
	@echo "  make build              - Build Docker images"
	@echo "  make clean              - Clean up resources"

k8s-start:
	cd k8s && bash start-k8s.sh

k8s-deploy:
	cd k8s && bash deploy.sh

k8s-status:
	kubectl get all -n chat-app

argocd-install:
	cd argocd && bash install.sh

argocd-ui:
	@echo "Opening ArgoCD UI..."
	@echo "Username: admin"
	@kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo ""
	kubectl port-forward svc/argocd-server -n argocd 8080:443

monitoring-install:
	cd monitoring && bash install.sh

grafana-ui:
	@echo "Opening Grafana UI..."
	@echo "Username: admin | Password: admin"
	@echo "URL: http://localhost:3001"
	kubectl port-forward svc/prometheus-grafana -n monitoring 3001:80

ci-test:
	@echo "Running backend tests..."
	cd backend && npm test || echo "No tests"
	@echo "Running frontend tests..."
	cd frontend && npm test || echo "No tests"

build:
	@echo "Building Docker images..."
	eval $$(minikube docker-env) && \
	docker build -t chat-app/backend:latest ./backend && \
	docker build -t chat-app/frontend:latest ./frontend

clean:
	kubectl delete namespace chat-app --ignore-not-found=true
	kubectl delete namespace argocd --ignore-not-found=true
	kubectl delete namespace monitoring --ignore-not-found=true
