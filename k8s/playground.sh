#!/bin/bash

# Kubernetes Playground - Interactive Commands
echo "🎮 Kubernetes Playground for Chat App"
echo "======================================"
echo ""

show_menu() {
    echo "Choose an action:"
    echo ""
    echo "📊 MONITORING:"
    echo "  1) View all pods"
    echo "  2) View services"
    echo "  3) View deployments"
    echo "  4) View ingress"
    echo "  5) View HPA status"
    echo "  6) View all resources"
    echo ""
    echo "🔍 DEBUGGING:"
    echo "  7) View backend logs"
    echo "  8) View frontend logs"
    echo "  9) View MongoDB logs"
    echo "  10) Describe a pod"
    echo "  11) Execute shell in backend pod"
    echo ""
    echo "⚡ SCALING:"
    echo "  12) Scale backend manually"
    echo "  13) Scale frontend manually"
    echo "  14) Test auto-scaling (load test)"
    echo ""
    echo "🔄 UPDATES:"
    echo "  15) Rolling update backend"
    echo "  16) Rollback backend"
    echo "  17) View rollout history"
    echo ""
    echo "🌐 ACCESS:"
    echo "  18) Port-forward frontend"
    echo "  19) Port-forward backend"
    echo "  20) Open in browser"
    echo ""
    echo "🧹 CLEANUP:"
    echo "  21) Delete all resources"
    echo "  22) Restart deployment"
    echo ""
    echo "  0) Exit"
    echo ""
}

while true; do
    show_menu
    read -p "Enter choice: " choice
    echo ""
    
    case $choice in
        1)
            echo "📦 Pods in chat-app namespace:"
            kubectl get pods -n chat-app -o wide
            ;;
        2)
            echo "🌐 Services:"
            kubectl get services -n chat-app
            ;;
        3)
            echo "🚀 Deployments:"
            kubectl get deployments -n chat-app
            ;;
        4)
            echo "🚪 Ingress:"
            kubectl get ingress -n chat-app
            ;;
        5)
            echo "📈 HPA Status:"
            kubectl get hpa -n chat-app
            kubectl top pods -n chat-app 2>/dev/null || echo "⚠️  Metrics not available yet"
            ;;
        6)
            echo "📋 All Resources:"
            kubectl get all -n chat-app
            ;;
        7)
            echo "📜 Backend Logs (Ctrl+C to exit):"
            kubectl logs -f -l app=backend -n chat-app --tail=50
            ;;
        8)
            echo "📜 Frontend Logs (Ctrl+C to exit):"
            kubectl logs -f -l app=frontend -n chat-app --tail=50
            ;;
        9)
            echo "📜 MongoDB Logs (Ctrl+C to exit):"
            kubectl logs -f -l app=mongodb -n chat-app --tail=50
            ;;
        10)
            kubectl get pods -n chat-app
            read -p "Enter pod name: " pod_name
            kubectl describe pod $pod_name -n chat-app
            ;;
        11)
            POD=$(kubectl get pod -l app=backend -n chat-app -o jsonpath="{.items[0].metadata.name}")
            echo "🐚 Connecting to $POD..."
            kubectl exec -it $POD -n chat-app -- /bin/sh
            ;;
        12)
            read -p "Enter number of replicas: " replicas
            kubectl scale deployment backend --replicas=$replicas -n chat-app
            echo "✅ Backend scaled to $replicas replicas"
            ;;
        13)
            read -p "Enter number of replicas: " replicas
            kubectl scale deployment frontend --replicas=$replicas -n chat-app
            echo "✅ Frontend scaled to $replicas replicas"
            ;;
        14)
            echo "🔥 Generating load on backend..."
            POD=$(kubectl get pod -l app=backend -n chat-app -o jsonpath="{.items[0].metadata.name}")
            kubectl exec -it $POD -n chat-app -- /bin/sh -c "while true; do echo 'stress'; done" &
            STRESS_PID=$!
            echo "⏳ Watch HPA scale up (Ctrl+C to stop):"
            kubectl get hpa -n chat-app -w
            kill $STRESS_PID 2>/dev/null
            ;;
        15)
            echo "🔄 Rolling update backend..."
            kubectl set image deployment/backend backend=chat-app/backend:v2 -n chat-app
            kubectl rollout status deployment/backend -n chat-app
            ;;
        16)
            echo "⏪ Rolling back backend..."
            kubectl rollout undo deployment/backend -n chat-app
            kubectl rollout status deployment/backend -n chat-app
            ;;
        17)
            echo "📜 Rollout History:"
            kubectl rollout history deployment/backend -n chat-app
            ;;
        18)
            echo "🌐 Port-forwarding frontend to localhost:3000..."
            echo "Access at: http://localhost:3000"
            kubectl port-forward service/frontend-service 3000:80 -n chat-app
            ;;
        19)
            echo "🔧 Port-forwarding backend to localhost:5001..."
            echo "Access at: http://localhost:5001"
            kubectl port-forward service/backend-service 5001:5001 -n chat-app
            ;;
        20)
            echo "🌐 Opening app in browser..."
            minikube service frontend-nodeport -n chat-app
            ;;
        21)
            read -p "⚠️  Delete all resources? (yes/no): " confirm
            if [ "$confirm" = "yes" ]; then
                kubectl delete namespace chat-app
                echo "✅ All resources deleted"
            fi
            ;;
        22)
            read -p "Restart which deployment? (backend/frontend): " dep
            kubectl rollout restart deployment/$dep -n chat-app
            echo "✅ $dep restarted"
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done