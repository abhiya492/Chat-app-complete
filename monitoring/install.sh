#!/bin/bash
set -e

echo "📊 Installing Prometheus & Grafana..."

# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f prometheus-values.yaml \
  --timeout 10m \
  --wait

echo ""
echo "✅ Monitoring stack installed!"
echo ""
echo "🌐 Access Grafana:"
echo "  kubectl port-forward svc/prometheus-grafana -n monitoring 3001:80"
echo "  URL: http://localhost:3001"
echo "  Username: admin"
echo "  Password: admin"
echo ""
echo "📊 Access Prometheus:"
echo "  kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090"
echo "  URL: http://localhost:9090"
