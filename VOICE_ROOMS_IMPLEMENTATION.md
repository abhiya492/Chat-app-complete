# 🎙️ Voice Rooms - Implementation Guide

## File Structure

```
backend/src/
├── models/
│   ├── room.model.js              ✨ NEW
│   └── roomAnalytics.model.js     ✨ NEW
├── controllers/
│   └── room.controller.js         ✨ NEW
├── routes/
│   └── room.route.js              ✨ NEW
├── services/
│   ├── roomService.js             ✨ NEW
│   └── webrtcService.js           ✨ NEW
├── lib/
│   ├── redis.js                   ✨ NEW
│   └── socket.js                  🔧 MODIFY
└── middleware/
    └── roomAuth.middleware.js     ✨ NEW

frontend/src/
├── components/
│   ├── VoiceRoom/
│   │   ├── RoomBrowser.jsx        ✨ NEW
│   │   ├── RoomCard.jsx           ✨ NEW
│   │   ├── CreateRoomModal.jsx    ✨ NEW
│   │   ├── RoomView.jsx           ✨ NEW
│   │   ├── ParticipantList.jsx    ✨ NEW
│   │   ├── AudioControls.jsx      ✨ NEW
│   │   └── HandRaiseQueue.jsx     ✨ NEW
├── store/
│   └── useRoomStore.js            ✨ NEW
├── lib/
│   └── webrtc-room.js             ✨ NEW
└── pages/
    └── Rooms.jsx                  ✨ NEW
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)
**Goal**: Basic room CRUD + database setup

**Tasks**:
1. ✅ Create Room model
2. ✅ Create Room API endpoints
3. ✅ Setup Redis connection
4. ✅ Create room controller
5. ✅ Add room routes

**Deliverable**: Can create/list/delete rooms via API

---

### Phase 2: Real-time Signaling (Day 3-4)
**Goal**: Socket.io room events + participant management

**Tasks**:
1. ✅ Extend socket.js with room events
2. ✅ Implement join/leave logic
3. ✅ Redis participant tracking
4. ✅ Role management (host/speaker/listener)
5. ✅ Hand raise mechanism

**Deliverable**: Users can join rooms, see participants, raise hands

---

### Phase 3: WebRTC Audio (Day 5-7)
**Goal**: Peer-to-peer audio streaming

**Tasks**:
1. ✅ WebRTC signaling via Socket.io
2. ✅ Peer connection management
3. ✅ Audio stream handling
4. ✅ Mute/unmute controls
5. ✅ Voice Activity Detection (VAD)

**Deliverable**: Users can speak and hear each other

---

### Phase 4: UI/UX (Day 8-10)
**Goal**: Beautiful, intuitive interface

**Tasks**:
1. ✅ Room browser with filters
2. ✅ Room view with participant grid
3. ✅ Audio controls (mute, leave, hand raise)
4. ✅ Moderation panel for hosts
5. ✅ Animations & transitions

**Deliverable**: Polished user experience

---

### Phase 5: Moderation & Polish (Day 11-12)
**Goal**: Host controls + edge cases

**Tasks**:
1. ✅ Kick/ban functionality
2. ✅ Promote/demote speakers
3. ✅ Room capacity limits
4. ✅ Error handling & reconnection
5. ✅ Analytics tracking

**Deliverable**: Production-ready feature

---

## Key Implementation Details

### 1. WebRTC Mesh Network (Simple Approach)

```javascript
// Each speaker maintains connections to all other speakers
// Suitable for <10 speakers

class RoomAudioManager {
  constructor(roomId, userId) {
    this.roomId = roomId;
    this.userId = userId;
    this.peers = new Map(); // peerId -> RTCPeerConnection
    this.localStream = null;
  }

  async initialize() {
    // Get microphone access
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });
  }

  async connectToPeer(peerId) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ]
    });

    // Add local audio track
    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream);
    });

    // Handle incoming audio
    pc.ontrack = (event) => {
      this.playRemoteAudio(peerId, event.streams[0]);
    };

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc:ice-candidate', {
          roomId: this.roomId,
          peerId,
          candidate: event.candidate
        });
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  playRemoteAudio(peerId, stream) {
    let audio = document.getElementById(`audio-${peerId}`);
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = `audio-${peerId}`;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
    audio.srcObject = stream;
  }

  disconnect() {
    this.peers.forEach(pc => pc.close());
    this.localStream?.getTracks().forEach(track => track.stop());
  }
}
```

### 2. Voice Activity Detection

```javascript
// Detect when user is speaking
class VoiceActivityDetector {
  constructor(stream, callback) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.callback = callback;
    this.isSpeaking = false;
    this.threshold = 30; // Adjust based on testing
    
    this.detect();
  }

  detect() {
    this.analyser.getByteFrequencyData(this.dataArray);
    
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
    const speaking = average > this.threshold;
    
    if (speaking !== this.isSpeaking) {
      this.isSpeaking = speaking;
      this.callback(speaking);
    }
    
    requestAnimationFrame(() => this.detect());
  }

  stop() {
    this.audioContext.close();
  }
}
```

### 3. Redis Participant Management

```javascript
// Fast lookups for active participants
class RoomParticipantCache {
  constructor(redis) {
    this.redis = redis;
  }

  async addParticipant(roomId, userId, data) {
    const key = `room:${roomId}:participants`;
    await this.redis.hset(key, userId, JSON.stringify({
      ...data,
      joinedAt: Date.now()
    }));
    await this.redis.expire(key, 86400); // 24h TTL
  }

  async removeParticipant(roomId, userId) {
    await this.redis.hdel(`room:${roomId}:participants`, userId);
  }

  async getParticipants(roomId) {
    const data = await this.redis.hgetall(`room:${roomId}:participants`);
    return Object.entries(data).map(([userId, json]) => ({
      userId,
      ...JSON.parse(json)
    }));
  }

  async updateParticipant(roomId, userId, updates) {
    const key = `room:${roomId}:participants`;
    const current = await this.redis.hget(key, userId);
    if (current) {
      const data = { ...JSON.parse(current), ...updates };
      await this.redis.hset(key, userId, JSON.stringify(data));
    }
  }

  async getParticipantCount(roomId) {
    return await this.redis.hlen(`room:${roomId}:participants`);
  }
}
```

### 4. Socket.io Room Events

```javascript
// backend/src/lib/socket.js additions

io.on('connection', (socket) => {
  // ... existing code ...

  // Room Events
  socket.on('room:join', async ({ roomId, role }) => {
    const userId = socket.userId;
    
    // Validate room exists and user can join
    const room = await Room.findById(roomId);
    if (!room || room.status !== 'active') {
      return socket.emit('room:error', { message: 'Room not found' });
    }

    // Check capacity
    const count = await participantCache.getParticipantCount(roomId);
    if (count >= room.maxParticipants) {
      return socket.emit('room:error', { message: 'Room is full' });
    }

    // Join socket room
    socket.join(`room:${roomId}`);

    // Add to Redis
    await participantCache.addParticipant(roomId, userId, {
      role: role || 'listener',
      socketId: socket.id,
      isMuted: false,
      handRaised: false
    });

    // Get all participants
    const participants = await participantCache.getParticipants(roomId);

    // Notify room
    io.to(`room:${roomId}`).emit('room:participant-joined', {
      userId,
      role: role || 'listener'
    });

    // Send current state to new user
    socket.emit('room:state', { participants });

    // Track analytics
    await Room.findByIdAndUpdate(roomId, {
      $inc: { totalJoins: 1 }
    });
  });

  socket.on('room:leave', async ({ roomId }) => {
    const userId = socket.userId;
    
    socket.leave(`room:${roomId}`);
    await participantCache.removeParticipant(roomId, userId);
    
    io.to(`room:${roomId}`).emit('room:participant-left', { userId });
  });

  socket.on('room:hand-raise', async ({ roomId }) => {
    const userId = socket.userId;
    
    await participantCache.updateParticipant(roomId, userId, {
      handRaised: true,
      handRaisedAt: Date.now()
    });
    
    io.to(`room:${roomId}`).emit('room:hand-raised', {
      userId,
      timestamp: Date.now()
    });
  });

  socket.on('room:promote', async ({ roomId, targetUserId }) => {
    const userId = socket.userId;
    
    // Check if requester is host
    const room = await Room.findById(roomId);
    if (room.createdBy.toString() !== userId) {
      return socket.emit('room:error', { message: 'Not authorized' });
    }

    // Update role
    await participantCache.updateParticipant(roomId, targetUserId, {
      role: 'speaker',
      handRaised: false
    });

    io.to(`room:${roomId}`).emit('room:role-changed', {
      userId: targetUserId,
      newRole: 'speaker'
    });
  });

  // WebRTC Signaling for rooms
  socket.on('room:webrtc:offer', ({ roomId, peerId, offer }) => {
    socket.to(`room:${roomId}`).emit('room:webrtc:offer', {
      peerId: socket.userId,
      offer
    });
  });

  socket.on('room:webrtc:answer', ({ roomId, peerId, answer }) => {
    io.to(`room:${roomId}`).emit('room:webrtc:answer', {
      peerId: socket.userId,
      answer
    });
  });

  socket.on('room:webrtc:ice-candidate', ({ roomId, peerId, candidate }) => {
    io.to(`room:${roomId}`).emit('room:webrtc:ice-candidate', {
      peerId: socket.userId,
      candidate
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    // Remove from all rooms
    const rooms = Array.from(socket.rooms);
    for (const room of rooms) {
      if (room.startsWith('room:')) {
        const roomId = room.replace('room:', '');
        await participantCache.removeParticipant(roomId, socket.userId);
        io.to(room).emit('room:participant-left', { userId: socket.userId });
      }
    }
  });
});
```

---

## Testing Checklist

### Unit Tests
- [ ] Room creation with valid/invalid data
- [ ] Permission checks (host, moderator, participant)
- [ ] Capacity limits enforcement
- [ ] Role transitions
- [ ] Hand raise queue ordering

### Integration Tests
- [ ] Join room → receive participant list
- [ ] Leave room → others notified
- [ ] Promote listener → becomes speaker
- [ ] Kick user → removed from room
- [ ] Room ends → all participants disconnected

### Manual Testing
- [ ] Audio quality in different network conditions
- [ ] Multiple speakers talking simultaneously
- [ ] Reconnection after network drop
- [ ] Mobile browser compatibility
- [ ] Background audio (mobile)

### Load Testing
- [ ] 10 users in one room
- [ ] 50 users in one room
- [ ] 10 concurrent rooms
- [ ] Rapid join/leave cycles

---

## Performance Benchmarks

### Target Metrics
- Room join latency: < 500ms
- WebRTC connection time: < 2s
- Audio latency: < 300ms
- CPU usage per room: < 5%
- Memory per participant: < 10MB

### Monitoring
```javascript
// Track key metrics
{
  roomJoinTime: Date.now() - startTime,
  webrtcConnectionTime: Date.now() - offerSentTime,
  audioLatency: measuredLatency,
  packetLoss: stats.packetsLost / stats.packetsReceived,
  jitter: stats.jitter
}
```

---

## Deployment Checklist

### Backend
- [ ] Redis installed and configured
- [ ] Environment variables set
- [ ] TURN server configured (for NAT traversal)
- [ ] Rate limiting enabled
- [ ] Monitoring/logging setup

### Frontend
- [ ] WebRTC polyfills for older browsers
- [ ] Microphone permission handling
- [ ] Error messages user-friendly
- [ ] Loading states for all actions
- [ ] Mobile responsive design

### Infrastructure
- [ ] SSL/TLS certificates (required for WebRTC)
- [ ] CORS configured correctly
- [ ] WebSocket connection stable
- [ ] Auto-scaling rules set
- [ ] Backup strategy for room data

---

## Common Issues & Solutions

### Issue: WebRTC connection fails
**Solution**: 
- Check STUN/TURN server configuration
- Verify SSL certificates
- Test with different networks
- Add fallback TURN servers

### Issue: Audio echo/feedback
**Solution**:
- Enable echoCancellation in getUserMedia
- Mute local audio element
- Use headphones during testing

### Issue: High CPU usage
**Solution**:
- Limit max speakers per room
- Use lower audio quality for listeners
- Implement SFU for large rooms

### Issue: Participants not syncing
**Solution**:
- Check Redis connection
- Verify socket.io room joins
- Add heartbeat mechanism
- Implement state reconciliation

---

## Next Steps After MVP

1. **Recording**: Save room audio to S3
2. **Transcription**: Real-time speech-to-text
3. **Reactions**: Emoji reactions during room
4. **Scheduled Rooms**: Calendar integration
5. **Mobile App**: Native iOS/Android
6. **Monetization**: Premium rooms, tips
7. **Discovery**: AI-powered recommendations
8. **Accessibility**: Closed captions, screen reader

