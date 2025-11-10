# 🌟 Real-Time Chat App with MERN Stack 🌟  
![Welcome Banner](https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&duration=4000&pause=500&color=F75C7E&width=435&lines=Welcome+to+the+Real-Time+Chat+App!;Powered+by+the+MERN+Stack!;Enjoy+Seamless+Real-Time+Messaging!+🚀)

Welcome to the Real-Time Chat App project! A production-ready chat application built with the MERN stack, featuring Docker containerization, Kubernetes orchestration, and enterprise-grade deployment options.

**[Live Demo 🚀](https://chat-app-complete.onrender.com)** | **[GitHub Repository ⭐](https://github.com/abhiya492/Chat-app-complete)**  

---

## 🛠️ Tech Stack  

### Core Technologies
- **MongoDB**: Database for user data and chat messages
- **Express.js**: Backend framework for RESTful APIs
- **React.js**: Frontend library with Vite for blazing-fast builds
- **Node.js**: JavaScript runtime for backend services
- **Socket.io**: Real-time bidirectional communication

### Additional Technologies
- **Redis**: Session management and caching
- **Cloudinary**: Cloud-based image storage and optimization
- **Nodemailer**: Email notifications
- **TailwindCSS**: Utility-first CSS framework
- **Daisy UI**: Pre-built UI components
- **Zustand**: Lightweight state management
- **Lucide React**: Modern icon library

### DevOps & Deployment
- **Docker**: Multi-stage containerization
- **Docker Compose**: Multi-container orchestration
- **Kubernetes**: Production-grade container orchestration
- **Helm**: Kubernetes package manager
- **Nginx**: Reverse proxy and static file serving

---

## 🌟 Features  

### Core Features
🎃 **Authentication & Authorization with JWT**  
👾 **Real-time messaging with Socket.io**  
🚀 **Online user status tracking**  
👌 **Global state management with Zustand**  
🖼️ **Image upload with Cloudinary integration**  
📧 **Email notifications with Nodemailer**  
🔔 **Sound notifications for new messages**  
💬 **User-to-user private messaging**  
🎨 **Theme customization (30+ themes)**  
📱 **Responsive design for all devices**  

### DevOps Features
🐳 **Docker containerization with multi-stage builds**  
☸️ **Kubernetes deployment with StatefulSets**  
📦 **Helm charts for easy deployment**  
🔄 **Horizontal Pod Autoscaling (HPA)**  
🔒 **Network policies for security**  
💾 **Persistent storage for databases**  
🏥 **Health checks for all services**  
🌐 **Ingress controller with TLS support**  

### Code Quality
🐞 **Comprehensive error handling**  
🔐 **Security best practices**  
⚡ **Optimized performance**  
📝 **Clean and maintainable code**  

---

## 🚀 Getting Started  

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (optional, for session management)
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhiya492/Chat-app-complete
   cd Chat-app-complete
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

---

## 🐳 Docker Deployment

### Quick Start with Docker
```bash
# Copy environment file
cp .env.example .env

# Start all services
./docker-start.sh

# Or manually
docker-compose up --build -d
```

### Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Docker Features
✅ Multi-stage builds for optimized images  
✅ Health checks for all services  
✅ Non-root users for security  
✅ Persistent volumes for data  
✅ Custom network for service communication  

📖 **[Full Docker Documentation](DOCKER.md)**

---

## ☸️ Kubernetes Deployment

### Quick Deploy to Kubernetes
```bash
cd k8s
./deploy.sh
```

### Using Helm
```bash
cd k8s/helm
helm install chat-app ./chat-app -n chat-app --create-namespace
```

### Kubernetes Features
- **StatefulSets** for MongoDB and Redis
- **Deployments** with auto-scaling (HPA)
- **Ingress** with NGINX controller
- **ConfigMaps** and **Secrets** for configuration
- **Persistent Volumes** for data persistence
- **Network Policies** for security
- **Health Checks** and **Readiness Probes**

📖 **[Full Kubernetes Documentation](KUBERNETES.md)**

---

## 📁 Project Structure

```
Chat-app-complete/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── lib/           # Utilities (DB, Cloudinary, Socket.io)
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   └── seeds/         # Database seeders
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   └── lib/           # Utilities (axios)
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/                    # Kubernetes configs
│   ├── base/              # Base manifests
│   ├── helm/              # Helm charts
│   └── overlays/          # Environment overlays
├── docker-compose.yml      # Docker Compose config
├── DOCKER.md              # Docker documentation
└── KUBERNETES.md          # Kubernetes documentation
```

---

## 🔧 Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database
MONGODB_URI=mongodb://localhost:27017/chat_db

# Server
PORT=5001
NODE_ENV=development
```

---

## 🧪 Testing

```bash
# Test MongoDB connection
node test-mongodb.js

# Run backend in dev mode
cd backend && npm run dev

# Run frontend in dev mode
cd frontend && npm run dev
```

---

## 📦 Build for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

---

## 🚢 Deployment Options

### 1. Traditional Hosting (Render, Heroku, Railway)
- Use the provided build scripts
- Set environment variables in platform dashboard
- Deploy from GitHub repository

### 2. Docker Deployment
- Use `docker-compose.yml` for single-server deployment
- Suitable for VPS (DigitalOcean, Linode, AWS EC2)

### 3. Kubernetes Deployment
- Use provided manifests or Helm charts
- Suitable for cloud providers (AWS EKS, GCP GKE, Azure AKS)
- Includes auto-scaling and high availability

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

---

## 👨‍💻 Author

**Abhishek**  
- GitHub: [@abhiya492](https://github.com/abhiya492)
- Live Demo: [chat-app-complete.onrender.com](https://chat-app-complete.onrender.com)

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

## 📚 Additional Resources

- [Docker Setup Guide](DOCKER.md)
- [Kubernetes Deployment Guide](KUBERNETES.md)
- [Kubernetes Quick Start](k8s/QUICKSTART.md)
