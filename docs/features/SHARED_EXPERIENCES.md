# 🎮 Shared Experiences - Implementation Guide

## 🎯 Features Overview

### 1. Watch Together 📺
- Sync YouTube videos with friends
- Real-time playback control
- Chat overlay during videos

### 2. Listen Together 🎵
- Spotify integration for shared music
- Synchronized playback
- Queue management

### 3. Mini Games 🎮
- Tic-tac-toe
- Chess
- Trivia games

### 4. Cursor Sharing 👆
- Real-time cursor positions
- Collaborative browsing

---

## 🚀 Quick Implementation (8 hours)

### Phase 1: Backend Setup (2 hours)
```bash
# Create shared experience models
touch backend/src/models/sharedExperience.model.js
touch backend/src/controllers/sharedExperience.controller.js
touch backend/src/routes/sharedExperience.route.js

# Add socket events
# Extend backend/src/lib/socket.js
```

### Phase 2: Frontend Store (1 hour)
```bash
touch frontend/src/store/useSharedStore.js
```

### Phase 3: Components (4 hours)
```bash
mkdir frontend/src/components/SharedExperiences
touch frontend/src/components/SharedExperiences/WatchTogether.jsx
touch frontend/src/components/SharedExperiences/ListenTogether.jsx
touch frontend/src/components/SharedExperiences/MiniGames.jsx
touch frontend/src/components/SharedExperiences/CursorShare.jsx
```

### Phase 4: Integration (1 hour)
```bash
# Add to chat interface
# Update frontend/src/components/messages/MessageContainer.jsx
```

---

## 💡 Technical Architecture

### Socket Events
```javascript
// Watch Together
'watch:start' - Start video session
'watch:sync' - Sync playback position
'watch:pause' - Pause for all
'watch:play' - Resume for all

// Listen Together
'music:start' - Start music session
'music:sync' - Sync track position
'music:queue' - Add to queue

// Games
'game:start' - Start game
'game:move' - Player move
'game:end' - Game over

// Cursor Share
'cursor:move' - Cursor position
'cursor:click' - Click event
```

### Data Models
```javascript
// Shared Experience Schema
{
  _id: ObjectId,
  type: 'watch|listen|game|cursor',
  chatId: ObjectId,
  participants: [ObjectId],
  data: {
    // Type-specific data
    videoId?: String,
    trackId?: String,
    gameState?: Object,
    cursorData?: Object
  },
  isActive: Boolean,
  createdAt: Date
}
```

---

## 🎬 Watch Together Implementation

### YouTube Integration
```javascript
// Uses YouTube IFrame API
const YOUTUBE_CONFIG = {
  height: '315',
  width: '560',
  playerVars: {
    autoplay: 1,
    controls: 1,
    rel: 0
  }
};
```

### Sync Logic
```javascript
// Every 5 seconds, host sends current time
setInterval(() => {
  if (isHost) {
    socket.emit('watch:sync', {
      currentTime: player.getCurrentTime(),
      isPlaying: player.getPlayerState() === 1
    });
  }
}, 5000);
```

---

## 🎵 Listen Together Implementation

### Spotify Web API
```javascript
// Requires Spotify Premium for playback control
const SPOTIFY_CONFIG = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  scopes: [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state'
  ]
};
```

### Queue System
```javascript
// Simple queue with voting
const queue = [
  { trackId: 'abc123', votes: 5, addedBy: 'user1' },
  { trackId: 'def456', votes: 3, addedBy: 'user2' }
];
```

---

## 🎮 Mini Games Implementation

### Game State Management
```javascript
// Tic-tac-toe example
const gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  players: {
    X: 'user1',
    O: 'user2'
  }
};
```

### Turn-based Logic
```javascript
// Validate moves server-side
function makeMove(gameId, position, playerId) {
  const game = getGame(gameId);
  if (game.currentPlayer !== getPlayerSymbol(playerId)) {
    throw new Error('Not your turn');
  }
  // Update game state
}
```

---

## 👆 Cursor Sharing Implementation

### Real-time Cursor Tracking
```javascript
// Throttled cursor events (60fps max)
let lastSent = 0;
document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastSent > 16) { // ~60fps
    socket.emit('cursor:move', {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
      timestamp: now
    });
    lastSent = now;
  }
});
```

### Cursor Visualization
```javascript
// Show other users' cursors
const cursors = new Map();
function updateCursor(userId, { x, y }) {
  let cursor = cursors.get(userId);
  if (!cursor) {
    cursor = createCursorElement(userId);
    cursors.set(userId, cursor);
  }
  cursor.style.left = `${x * window.innerWidth}px`;
  cursor.style.top = `${y * window.innerHeight}px`;
}
```

---

## 🔧 Environment Setup

### Required API Keys
```bash
# backend/.env
YOUTUBE_API_KEY=your_youtube_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

### Dependencies
```bash
# Backend
npm install youtube-api spotify-web-api-node

# Frontend  
npm install react-youtube spotify-web-playback-sdk
```

---

## 📱 UI Components

### Shared Experience Panel
```
┌─────────────────────────────────┐
│  🎮 Shared Experiences          │
├─────────────────────────────────┤
│  📺 Watch Together              │
│  🎵 Listen Together             │
│  🎮 Mini Games                  │
│  👆 Cursor Share                │
├─────────────────────────────────┤
│  Active: 🎬 Watching "Video"    │
│  👥 3 participants              │
│  [Leave] [Controls]             │
└─────────────────────────────────┘
```

### Watch Together Interface
```
┌─────────────────────────────────┐
│  🎬 Watch Together              │
├─────────────────────────────────┤
│  [YouTube URL Input]  [Start]   │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │                             │ │
│  │      YouTube Player         │ │
│  │                             │ │
│  └─────────────────────────────┘ │
├─────────────────────────────────┤
│  👥 Watching: John, Sarah, Mike │
│  💬 Chat overlay enabled        │
└─────────────────────────────────┘
```

---

## 🚦 Implementation Priority

### Week 1: Core Features
1. **Day 1-2**: Watch Together (YouTube)
2. **Day 3-4**: Mini Games (Tic-tac-toe)
3. **Day 5**: Cursor Sharing

### Week 2: Advanced Features  
1. **Day 6-7**: Listen Together (Spotify)
2. **Day 8-9**: More games (Chess, Trivia)
3. **Day 10**: Polish & testing

---

## 📊 Success Metrics

### MVP Success
- [ ] 2+ users can watch YouTube together
- [ ] Playback stays in sync (±2 seconds)
- [ ] Tic-tac-toe works end-to-end
- [ ] Cursor sharing has <100ms latency

### Production Ready
- [ ] Supports 10+ concurrent sessions
- [ ] Works on mobile devices
- [ ] Handles network interruptions
- [ ] Analytics tracking implemented

---

## 🎯 Next Steps

Ready to implement? I'll create the actual code files:

1. **Backend Models & Controllers**
2. **Socket.io Event Handlers** 
3. **Frontend Components**
4. **Integration with Chat Interface**

Let me know which feature you want to start with! 🚀