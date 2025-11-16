#!/bin/bash

echo "🎯 Access Your Dashboards"
echo "========================="
echo ""
echo "Choose an option:"
echo "1. ArgoCD UI (GitOps)"
echo "2. Grafana UI (Monitoring)"
echo "3. Prometheus UI (Metrics)"
echo "4. Chat App"
echo "5. All Status"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo ""
    echo "🔐 ArgoCD Credentials:"
    echo "Username: admin"
    echo -n "Password: "
    kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
    echo ""
    echo ""
    echo "🌐 Opening ArgoCD at https://localhost:8080"
    echo "Press Ctrl+C to stop"
    kubectl port-forward svc/argocd-server -n argocd 8080:443
    ;;
  2)
    echo ""
    echo "🔐 Grafana Credentials:"
    echo "Username: admin"
    echo "Password: admin"
    echo ""
    echo "🌐 Opening Grafana at http://localhost:3001"
    echo "Press Ctrl+C to stop"
    kubectl port-forward svc/prometheus-grafana -n monitoring 3001:80
    ;;
  3)
    echo ""
    echo "🌐 Opening Prometheus at http://localhost:9090"
    echo "Press Ctrl+C to stop"
    kubectl port-forward svc/prometheus-kube-prometheus-prometheus -n monitoring 9090:9090
    ;;
  4)
    echo ""
    echo "🌐 Opening Chat App"
    minikube service frontend-nodeport -n chat-app
    ;;
  5)
    echo ""
    echo "📊 Current Status:"
    echo ""
    echo "=== ArgoCD ==="
    kubectl get pods -n argocd
    echo ""
    echo "=== Monitoring ==="
    kubectl get pods -n monitoring
    echo ""
    echo "=== Chat App ==="
    kubectl get pods -n chat-app
    echo ""
    echo "=== Services ==="
    kubectl get svc -n chat-app
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
