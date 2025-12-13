# 🎙️ Voice Rooms - Quick Start Guide

## TL;DR - What You're Building

**Voice Rooms** = Clubhouse/Twitter Spaces for your chat app
- Users create/join live audio rooms
- Roles: Host (controls room) → Speakers (can talk) → Listeners (hear only)
- Hand raise to request speaking
- WebRTC for real-time audio
- Works in browser (no app needed)

---

## 📊 Big Picture

```
User Flow:
1. Browse active rooms → 2. Join room → 3. Raise hand → 4. Get promoted to speaker → 5. Talk!

Tech Stack:
Frontend: React + WebRTC → Socket.io → Backend: Node.js + Redis + MongoDB
```

---

## 🎯 MVP Scope (12 days)

### Week 1: Core Infrastructure
**Day 1-2**: Database + API
- Room model (MongoDB)
- CRUD endpoints
- Redis setup

**Day 3-4**: Real-time Events
- Socket.io room events
- Join/leave logic
- Participant tracking

**Day 5-7**: Audio Streaming
- WebRTC peer connections
- Microphone access
- Audio playback

### Week 2: UI + Polish
**Day 8-10**: User Interface
- Room browser
- Room view
- Audio controls

**Day 11-12**: Moderation + Testing
- Host controls
- Error handling
- Load testing

---

## 🚀 Implementation Order

### Step 1: Backend Models (30 min)
```bash
# Create files
touch backend/src/models/room.model.js
touch backend/src/controllers/room.controller.js
touch backend/src/routes/room.route.js
```

### Step 2: Redis Setup (15 min)
```bash
# Install Redis
brew install redis  # macOS
redis-server        # Start Redis

# Install client
cd backend && npm install redis
```

### Step 3: Socket.io Extensions (1 hour)
```javascript
// Add to backend/src/lib/socket.js
- room:join event
- room:leave event
- room:hand-raise event
- WebRTC signaling events
```

### Step 4: Frontend Store (30 min)
```bash
# Create Zustand store
touch frontend/src/store/useRoomStore.js
```

### Step 5: WebRTC Manager (2 hours)
```bash
# Create WebRTC logic
touch frontend/src/lib/webrtc-room.js
```

### Step 6: UI Components (4 hours)
```bash
mkdir frontend/src/components/VoiceRoom
touch frontend/src/components/VoiceRoom/RoomBrowser.jsx
touch frontend/src/components/VoiceRoom/RoomView.jsx
touch frontend/src/components/VoiceRoom/AudioControls.jsx
```

---

## 💡 Key Concepts

### 1. WebRTC Mesh Network
```
Speaker A ←→ Speaker B
    ↕           ↕
Speaker C ←→ Speaker D

Each speaker connects to every other speaker
Works for <10 speakers
```

### 2. Role Hierarchy
```
Host (1)
  ├─ Can: End room, promote/demote, kick, ban
  └─ Moderators (0-5)
      ├─ Can: Kick, mute, promote
      └─ Speakers (0-10)
          ├─ Can: Talk, mute self
          └─ Listeners (unlimited)
              └─ Can: Listen, raise hand
```

### 3. State Layers
```
MongoDB (Persistent)
  ↓ Room metadata, history
Redis (Cache - 24h TTL)
  ↓ Active participants, roles
Socket.io (Ephemeral)
  ↓ WebRTC signals, events
```

---

## 🔧 Configuration

### Environment Variables
```bash
# backend/.env
REDIS_URL=redis://localhost:6379
TURN_SERVER_URL=turn:your-server.com:3478
TURN_USERNAME=user
TURN_PASSWORD=pass
```

### Audio Settings
```javascript
// Recommended defaults
{
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 24000,      // 24kHz = good quality
  channelCount: 1,        // Mono for voice
}
```

### Room Limits
```javascript
const LIMITS = {
  maxParticipants: 50,
  maxSpeakers: 10,
  maxRoomDuration: 12 * 60 * 60 * 1000, // 12 hours
  maxRoomsPerUser: 5,     // per day
};
```

---

## 🐛 Common Issues

### Issue: "Permission denied" for microphone
**Fix**: Ensure HTTPS (WebRTC requires secure context)
```javascript
// Check if secure context
if (!window.isSecureContext) {
  alert('Voice rooms require HTTPS');
}
```

### Issue: Audio echo/feedback
**Fix**: Enable echo cancellation + use headphones
```javascript
const constraints = {
  audio: {
    echoCancellation: true,  // ← Critical!
    noiseSuppression: true,
  }
};
```

### Issue: Can't connect to peer
**Fix**: Add TURN server for NAT traversal
```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

### Issue: High CPU usage
**Fix**: Limit max speakers
```javascript
if (speakerCount >= 10) {
  return error('Room is full');
}
```

---

## 📈 Metrics to Track

### Day 1 Metrics
- [ ] Rooms created: > 10
- [ ] Average participants: > 3
- [ ] WebRTC success rate: > 80%

### Week 1 Metrics
- [ ] Daily active rooms: > 50
- [ ] Average duration: > 10 minutes
- [ ] Return rate: > 30%

### Month 1 Metrics
- [ ] Daily active rooms: > 500
- [ ] Average duration: > 20 minutes
- [ ] Return rate: > 40%

---

## 🎨 UI/UX Guidelines

### Room Browser
```
┌─────────────────────────────────┐
│  🎙️ Voice Rooms                 │
├─────────────────────────────────┤
│  [Create Room] [Filter ▼]       │
├─────────────────────────────────┤
│  🔴 Late Night Coding            │
│  👥 8/50  🎤 3 speakers          │
│  #tech #programming              │
├─────────────────────────────────┤
│  🔴 Music Listening Party        │
│  👥 15/50  🎤 2 speakers         │
│  #music #chill                   │
└─────────────────────────────────┘
```

### Room View
```
┌─────────────────────────────────┐
│  🎙️ Late Night Coding           │
│  Host: @john                     │
├─────────────────────────────────┤
│  🎤 Speakers (3)                 │
│  ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ 👤  │ │ 👤  │ │ 👤  │        │
│  │John │ │Sarah│ │Mike │        │
│  │ 🔊  │ │ 🔇  │ │ 🔊  │        │
│  └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────┤
│  👋 Hand Raised (2)              │
│  • Alex (2m ago)                 │
│  • Emma (1m ago)                 │
├─────────────────────────────────┤
│  👥 Listeners (5)                │
│  • Tom • Lisa • ...              │
├─────────────────────────────────┤
│  [🎤 Mute] [✋ Raise] [🚪 Leave] │
└─────────────────────────────────┘
```

---

## 🚦 Go/No-Go Checklist

### Before Starting
- [ ] Understand WebRTC basics
- [ ] Redis installed and running
- [ ] HTTPS setup (required for WebRTC)
- [ ] 12 days available for focused work

### Before Launch
- [ ] Tested with 10+ users in one room
- [ ] Works on mobile browsers
- [ ] Error messages are user-friendly
- [ ] Moderation tools work
- [ ] Analytics tracking implemented

---

## 📚 Resources

### Learn WebRTC
- [WebRTC Basics](https://webrtc.org/getting-started/overview)
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

### Example Code
- [Simple WebRTC Demo](https://webrtc.github.io/samples/)
- [Socket.io Rooms](https://socket.io/docs/v4/rooms/)

### TURN Servers
- [Twilio TURN](https://www.twilio.com/stun-turn) - Free tier
- [Xirsys](https://xirsys.com/) - Free tier
- [coturn](https://github.com/coturn/coturn) - Self-hosted

---

## 🎯 Success Definition

**MVP is successful if**:
- ✅ 3+ people can talk in a room simultaneously
- ✅ Audio quality is clear (no echo, low latency)
- ✅ Host can promote/kick users
- ✅ Works on Chrome, Safari, Firefox
- ✅ Mobile responsive

**Ready for production if**:
- ✅ 50+ users in one room
- ✅ WebRTC success rate > 95%
- ✅ Uptime > 99%
- ✅ Load tested
- ✅ Error monitoring setup

---

## 🚀 Next Steps

1. **Read**: `VOICE_ROOMS_ARCHITECTURE.md` (full system design)
2. **Review**: `VOICE_ROOMS_IMPLEMENTATION.md` (code examples)
3. **Decide**: `VOICE_ROOMS_DECISIONS.md` (trade-offs)
4. **Build**: Start with Phase 1 (backend models)

**Ready to start?** Let me know and I'll generate the actual code files! 🎉
