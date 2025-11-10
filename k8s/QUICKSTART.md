# 🎮 Kubernetes Playground - Quick Start

## 🚀 Setup (5 minutes)

### 1. Install Tools
```bash
cd k8s
./setup-local.sh
```

### 2. Start Minikube Cluster
```bash
# Start with 4 CPUs and 8GB RAM
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify cluster is running
kubectl cluster-info
```

### 3. Build Docker Images
```bash
# Build images in minikube's Docker environment
./build-images.sh
```

### 4. Deploy Chat App
```bash
# Deploy all resources
./deploy.sh
```

### 5. Access Your App
```bash
# Option 1: Port Forward (Recommended)
kubectl port-forward service/frontend-service 3000:80 -n chat-app
# Open: http://localhost:3000

# Option 2: NodePort
minikube service frontend-nodeport -n chat-app

# Option 3: Ingress (requires /etc/hosts entry)
echo "$(minikube ip) chat-app.local" | sudo tee -a /etc/hosts
# Open: http://chat-app.local
```

---

## 🎯 Interactive Playground

### Launch Interactive Menu
```bash
./playground.sh
```

This gives you a menu with 22+ commands to explore Kubernetes!

---

## 🎓 Learning Exercises

### Exercise 1: Watch Pods Start
```bash
# Watch pods being created in real-time
kubectl get pods -n chat-app -w
```

### Exercise 2: Scale Your App
```bash
# Scale backend to 5 replicas
kubectl scale deployment backend --replicas=5 -n chat-app

# Watch it scale
kubectl get pods -n chat-app -w
```

### Exercise 3: Test Self-Healing
```bash
# Delete a pod and watch it auto-recreate
kubectl delete pod <pod-name> -n chat-app
kubectl get pods -n chat-app -w
```

### Exercise 4: View Logs
```bash
# Stream backend logs
kubectl logs -f -l app=backend -n chat-app

# View last 50 lines
kubectl logs -l app=backend -n chat-app --tail=50
```

### Exercise 5: Execute Commands in Pod
```bash
# Get shell access to backend pod
kubectl exec -it <backend-pod-name> -n chat-app -- /bin/sh

# Inside pod, try:
ls -la
env | grep MONGO
node -v
```

### Exercise 6: Test Auto-Scaling
```bash
# Generate CPU load
kubectl run -it --rm load-generator --image=busybox -n chat-app -- /bin/sh
# Inside: while true; do wget -q -O- http://backend-service:5001; done

# Watch HPA scale up
kubectl get hpa -n chat-app -w
```

### Exercise 7: Rolling Update
```bash
# Update backend image
kubectl set image deployment/backend backend=chat-app/backend:v2 -n chat-app

# Watch rolling update
kubectl rollout status deployment/backend -n chat-app

# Rollback if needed
kubectl rollout undo deployment/backend -n chat-app
```

### Exercise 8: Network Policies
```bash
# Try to access MongoDB from frontend (should fail)
kubectl exec -it <frontend-pod> -n chat-app -- wget -O- mongodb-service:27017

# Access from backend (should work)
kubectl exec -it <backend-pod> -n chat-app -- wget -O- mongodb-service:27017
```

### Exercise 9: Resource Monitoring
```bash
# View resource usage
kubectl top pods -n chat-app
kubectl top nodes

# Describe pod to see resource limits
kubectl describe pod <pod-name> -n chat-app
```

### Exercise 10: Service Discovery
```bash
# DNS resolution test
kubectl run -it --rm debug --image=busybox -n chat-app -- nslookup backend-service
kubectl run -it --rm debug --image=busybox -n chat-app -- nslookup mongodb-service
```

---

## 🔍 Useful Commands Cheat Sheet

### Viewing Resources
```bash
kubectl get all -n chat-app                    # All resources
kubectl get pods -n chat-app -o wide           # Pods with details
kubectl get services -n chat-app               # Services
kubectl get deployments -n chat-app            # Deployments
kubectl get statefulsets -n chat-app           # StatefulSets
kubectl get pv,pvc -n chat-app                 # Storage
kubectl get ingress -n chat-app                # Ingress
kubectl get hpa -n chat-app                    # Auto-scalers
```

### Debugging
```bash
kubectl describe pod <pod-name> -n chat-app    # Pod details
kubectl logs <pod-name> -n chat-app            # Pod logs
kubectl logs -f <pod-name> -n chat-app         # Stream logs
kubectl exec -it <pod-name> -n chat-app -- sh  # Shell access
kubectl port-forward <pod-name> 8080:5001      # Port forward
```

### Scaling
```bash
kubectl scale deployment backend --replicas=5 -n chat-app
kubectl autoscale deployment backend --min=2 --max=10 --cpu-percent=70 -n chat-app
```

### Updates
```bash
kubectl set image deployment/backend backend=new-image -n chat-app
kubectl rollout status deployment/backend -n chat-app
kubectl rollout history deployment/backend -n chat-app
kubectl rollout undo deployment/backend -n chat-app
```

### Cleanup
```bash
kubectl delete namespace chat-app              # Delete everything
kubectl delete pod <pod-name> -n chat-app      # Delete specific pod
kubectl delete deployment backend -n chat-app  # Delete deployment
```

---

## 🎪 Fun Experiments

### 1. Chaos Engineering
```bash
# Kill random pods and watch recovery
while true; do
  POD=$(kubectl get pods -n chat-app -l app=backend -o name | shuf -n1)
  kubectl delete $POD -n chat-app
  sleep 30
done
```

### 2. Load Testing
```bash
# Install hey (HTTP load generator)
brew install hey

# Port forward backend
kubectl port-forward service/backend-service 5001:5001 -n chat-app &

# Generate load
hey -z 60s -c 50 http://localhost:5001/api/auth/check

# Watch HPA scale
kubectl get hpa -n chat-app -w
```

### 3. Network Latency Simulation
```bash
# Add latency to backend pods
kubectl exec <backend-pod> -n chat-app -- tc qdisc add dev eth0 root netem delay 100ms
```

---

## 🧹 Cleanup

### Stop Everything
```bash
# Delete namespace (removes all resources)
kubectl delete namespace chat-app

# Stop minikube
minikube stop

# Delete cluster
minikube delete
```

---

## 🆘 Troubleshooting

### Pods Not Starting
```bash
kubectl describe pod <pod-name> -n chat-app
kubectl logs <pod-name> -n chat-app
```

### Images Not Found
```bash
# Rebuild images
eval $(minikube docker-env)
./build-images.sh
```

### Can't Access App
```bash
# Check services
kubectl get services -n chat-app

# Port forward directly
kubectl port-forward service/frontend-service 3000:80 -n chat-app
```

### Metrics Not Available
```bash
# Enable metrics-server
minikube addons enable metrics-server

# Wait 2-3 minutes, then check
kubectl top pods -n chat-app
```

---

## 📚 Next Steps

1. ✅ Deploy app successfully
2. ✅ Explore with playground.sh
3. ✅ Complete all 10 exercises
4. 🎯 Try fun experiments
5. 🚀 Move to CI/CD pipelines

**Have fun playing with Kubernetes!** 🎮