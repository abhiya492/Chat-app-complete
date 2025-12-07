# 🐳 Docker Setup Guide

## Quick Start
```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Edit .env with your credentials
nano .env

# 3. Start the application
./docker-start.sh
```

## Manual Commands
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## Service URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React+Nginx) │◄──►│   (Node.js)     │
│   Port: 3000    │    │   Port: 5001    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────┐    ┌─────────────────┐
         │   MongoDB       │    │   Redis         │
         │   Port: 27017   │    │   Port: 6379    │
         └─────────────────┘    └─────────────────┘
```

## Key Features
✅ **Multi-stage builds** for optimized images  
✅ **Health checks** for all services  
✅ **Non-root users** for security  
✅ **Persistent volumes** for data  
✅ **Custom network** for service communication  
✅ **Environment-based configuration**  

## Troubleshooting
```bash
# Check service status
docker-compose ps

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Restart a service
docker-compose restart backend

# Rebuild a service
docker-compose up --build backend
```