# 🌟 Real-Time Chat App 🌟  
![Welcome Banner](https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&duration=4000&pause=500&color=F75C7E&width=435&lines=Welcome+to+the+Real-Time+Chat+App!;Powered+by+the+MERN+Stack!;Enjoy+Seamless+Real-Time+Messaging!+🚀)

Welcome to the **Real-Time Chat App** - A feature-rich, production-ready chat application built with the MERN stack. This project includes everything from basic messaging to advanced features like video calls, AI chatbot, games, and voice rooms!

**[Live Demo 🚀](https://chat-app-complete.onrender.com)** | **[GitHub Repository ⭐](https://github.com/abhiya492/Chat-app-complete)**  

---

## 🛠️ Tech Stack  

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication & authorization
- **Passport.js** - OAuth authentication
- **Cloudinary** - Media storage
- **Nodemailer** - Email service

### Frontend
- **React.js** - UI library
- **Zustand** - State management
- **TailwindCSS** - Utility-first CSS
- **Daisy UI** - Component library
- **Framer Motion** - Animations
- **React Router** - Navigation

### Real-Time Features
- **WebRTC** - Peer-to-peer video/audio calls
- **Socket.io** - Live messaging, typing indicators, presence

### AI & ML
- **Groq API** - AI-powered chatbot
- **LLaMA 3** - Language model integration

### DevOps
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **GitHub Actions** - CI/CD

---

## ✨ Complete Feature List

### 🔐 Authentication & Security
- ✅ JWT-based authentication
- ✅ **Google OAuth 2.0** - Sign in with Google
- ✅ Password hashing with bcrypt
- ✅ Email verification with OTP
- ✅ Forgot password functionality
- ✅ Session management
- ✅ Protected routes
- ✅ Multi-provider authentication
- ✅ **Rate Limiting** - Prevent brute force & DDoS attacks
- ✅ **Socket Rate Limiting** - Prevent event flooding

### 💬 Core Messaging Features
- ✅ Real-time messaging with Socket.io
- ✅ Message reactions (emojis)
- ✅ Reply to messages
- ✅ Edit messages
- ✅ Delete messages
- ✅ Forward messages
- ✅ Pin messages
- ✅ Message search
- ✅ Typing indicators
- ✅ Message delivery status (sent/delivered/read)
- ✅ Read receipts (double check marks)
- ✅ Online/offline status
- ✅ Last seen timestamp

### 📎 Media & File Sharing
- ✅ Image sharing (up to 10MB)
- ✅ Video sharing
- ✅ Voice messages
- ✅ File attachments
- ✅ Cloudinary integration
- ✅ Media preview
- ✅ Download files

### 📞 Voice & Video Calls
- ✅ WebRTC peer-to-peer calls
- ✅ Video calls with camera toggle
- ✅ Audio calls with mic toggle
- ✅ Call history tracking
- ✅ Call duration display
- ✅ Incoming call notifications
- ✅ Accept/reject calls
- ✅ Call quality indicators

### 🎙️ Voice Rooms (Clubhouse-style)
- ✅ Create public/private rooms
- ✅ Up to 20 participants per room
- ✅ Speaker/listener roles
- ✅ Hand raise feature
- ✅ Promote/demote speakers
- ✅ Real-time audio streaming
- ✅ Room moderation

### 🎮 Shared Experiences (Games)
- ✅ **Tic-Tac-Toe** - Real-time multiplayer
- ✅ **Rock Paper Scissors** - Best of 5 rounds
- ✅ **Chess** - Full implementation with move validation
- ✅ **Cursor Sharing** - See friend's cursor in real-time
- ✅ Game invitations
- ✅ Turn-based gameplay
- ✅ Winner detection
- ✅ Score tracking

### ⚔️ Challenge Arena (Multiplayer RPG Games)
- ✅ **Challenge Button** - Green button with crossed swords icon
- ✅ **6 Game Modes** - Fantasy, Mystery, Sci-Fi, Debate, Trivia, Story
- ✅ **Online Players List** - See all available players with stats
- ✅ **Player Statistics** - Level, XP, wins, losses tracking
- ✅ **Real-time Challenges** - Instant challenge notifications
- ✅ **Turn-based RPG Combat** - Attack, Defend, Cast Spell actions
- ✅ **Dice Rolling System** - Random event generation
- ✅ **Game Stats** - Health, Mana, Power tracking
- ✅ **Level & XP System** - Progress through gameplay
- ✅ **Game History** - Track all played games

### 🤖 AI Chatbot
- ✅ Groq API integration
- ✅ LLaMA 3 model
- ✅ Context-aware responses
- ✅ Natural language processing
- ✅ Smart replies
- ✅ Conversation history

### 👤 User Profiles & Customization
- ✅ Profile pictures
- ✅ Bio and status
- ✅ User info modal
- ✅ Edit profile
- ✅ Privacy settings
- ✅ Last seen visibility
- ✅ Profile visibility controls
- ✅ Block/unblock users

### 🎨 Themes & UI/UX
- ✅ 30+ themes (light & dark modes)
- ✅ Theme switcher
- ✅ Responsive design
- ✅ Mobile-friendly
- ✅ Smooth animations
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Modal dialogs

### 📊 Advanced Features
- ✅ Message translation
- ✅ Sentiment analysis
- ✅ Smart replies
- ✅ Message forwarding
- ✅ Pinned messages
- ✅ Message search
- ✅ Analytics dashboard
- ✅ PWA support
- ✅ Push notifications
- ✅ Internationalization (i18n)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhiya492/Chat-app-complete
   cd Chat-app-complete
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Environment Setup**
   
   Create `.env` in backend folder:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5001
   NODE_ENV=development
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email (Optional)
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   
   # Groq AI (Optional)
   GROQ_API_KEY=your_groq_api_key
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
   CLIENT_URL=http://localhost:5173
   ```

4. **Run the application**
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

---

## 📖 Documentation

All documentation has been organized in the [`docs/`](./docs/) folder.

### Core Features
- 📝 [Messaging Features](./docs/MESSAGING_FEATURES.md) - Complete messaging guide
- 📞 [WebRTC Features](./docs/WEBRTC_FEATURES.md) - Voice & video calling setup
- 👤 [User Profile Features](./docs/USER_PROFILE_FEATURES.md) - Profile & customization
- 🎨 [UX Enhancements](./docs/UX_ENHANCEMENTS.md) - PWA, notifications, themes

### Advanced Features
- 🎮 [Shared Experiences](./docs/SHARED_EXPERIENCES.md) - Games implementation guide
- 🎮 [Shared Experiences Integration](./docs/SHARED_EXPERIENCES_INTEGRATION.md) - Quick setup
- ⚔️ [Challenge Feature](./docs/CHALLENGE_FEATURE.md) - Multiplayer RPG games guide
- 🎙️ [Voice Rooms Quickstart](./docs/VOICE_ROOMS_QUICKSTART.md) - Voice rooms setup
- 🎙️ [Voice Rooms Architecture](./docs/VOICE_ROOMS_ARCHITECTURE.md) - Technical architecture
- 🎙️ [Voice Rooms Implementation](./docs/VOICE_ROOMS_IMPLEMENTATION.md) - Implementation details
- 🎙️ [Voice Rooms Testing](./docs/VOICE_ROOMS_TESTING.md) - Testing guide

### AI Features
- 🤖 [AI Features](./docs/AI_FEATURES.md) - AI chatbot features
- 🤖 [AI Upgrade](./docs/AI_UPGRADE.md) - AI upgrade guide
- 🤖 [Groq Setup](./docs/GROQ_SETUP.md) - Groq API setup
- 🧪 [Test AI Features](./docs/TEST_AI_FEATURES.md) - Testing AI features

### Setup & Configuration
- ⚙️ [Quick Start](./docs/QUICK_START.md) - Quick start guide
- ⚙️ [Quick Reference](./docs/QUICK_REFERENCE.md) - Quick reference
- 🔐 [Google OAuth Setup](./docs/GOOGLE_OAUTH_SETUP.md) - Google OAuth setup
- 📧 [Email Setup Guide](./docs/EMAIL_SETUP_GUIDE.md) - Email configuration
- 📞 [Setup Calls](./docs/SETUP_CALLS.md) - WebRTC setup
- 💾 [Storage Options](./docs/STORAGE_OPTIONS.md) - Storage configuration
- 🛡️ [Rate Limiting](./docs/RATE_LIMITING.md) - Rate limiting guide
- 🛡️ [Rate Limiting Summary](./docs/RATE_LIMITING_SUMMARY.md) - Quick summary
- 🏛️ [Rate Limiting Architecture](./docs/RATE_LIMITING_ARCHITECTURE.md) - Architecture details

### DevOps & Deployment
- 🐳 [Docker](./docs/DOCKER.md) - Docker containerization
- ☸️ [Kubernetes](./docs/KUBERNETES.md) - Kubernetes deployment
- 🎙️ [Voice Rooms Free Tier](./docs/VOICE_ROOMS_FREE_TIER.md) - Free tier deployment

### Summary Documents
- 📋 [Features Complete](./docs/FEATURES_COMPLETE.md) - Complete feature list
- 📋 [Features Summary](./docs/FEATURES_COMPLETE_SUMMARY.md) - Feature summary
- 📋 [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md) - Implementation summary
- 📋 [Profile Implementation](./docs/PROFILE_IMPLEMENTATION_SUMMARY.md) - Profile features

**📂 [Browse All Documentation](./docs/)**

---

## 🏗️ Project Structure

```
Chat-app-complete/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── lib/              # Utilities (socket, cloudinary)
│   │   └── index.js          # Entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── lib/              # Utilities
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   └── package.json
│
├── docs/                     # Documentation files
├── docker-compose.yml        # Docker configuration
├── k8s/                      # Kubernetes manifests
└── README.md                 # This file
```

---

## 🎯 Key Features Breakdown

### Real-Time Communication
- **Socket.io** for instant messaging
- **WebRTC** for peer-to-peer calls
- **Typing indicators** show when someone is typing
- **Online status** with last seen
- **Read receipts** with double check marks

### Media Handling
- **Cloudinary** integration for media storage
- Support for images, videos, voice messages
- File size limits and validation
- Media preview and download

### User Experience
- **30+ themes** with light/dark modes
- **Responsive design** for all devices
- **PWA support** for mobile installation
- **Push notifications** for new messages
- **Smooth animations** with Framer Motion

### Security
- **JWT authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Email verification** with OTP
- **Protected routes** on frontend and backend
- **Input validation** and sanitization

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/chat-app

# Server
PORT=5001
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Groq AI (Optional)
GROQ_API_KEY=your_groq_api_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

---

## 🚢 Deployment

### Docker
```bash
docker-compose up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### Manual Deployment
See [DOCKER.md](./DOCKER.md) and [KUBERNETES.md](./KUBERNETES.md) for detailed instructions.

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for controllers
- Integration tests for API routes
- E2E tests for critical flows
- Socket.io event testing

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Abhishek Kumar**
- GitHub: [@abhiya492](https://github.com/abhiya492)
- Live Demo: [chat-app-complete.onrender.com](https://chat-app-complete.onrender.com)

---

## 🙏 Acknowledgments

- Socket.io for real-time communication
- WebRTC for video/audio calls
- Cloudinary for media storage
- Groq for AI capabilities
- TailwindCSS & Daisy UI for beautiful UI
- All contributors and supporters!

---

## 📊 Project Stats

- **Total Features**: 100+
- **Lines of Code**: 50,000+
- **Components**: 80+
- **API Endpoints**: 40+
- **Socket Events**: 50+
- **Documentation Pages**: 25+

---

## 🎉 What's Next?

- [ ] Group chats
- [ ] Message encryption
- [ ] Screen sharing
- [ ] More games
- [ ] Voice messages transcription
- [ ] Advanced analytics
- [ ] Mobile apps (React Native)

---

**⭐ If you like this project, please give it a star on GitHub!**

**🚀 Happy Coding!**
