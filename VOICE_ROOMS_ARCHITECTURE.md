# 🎙️ Voice Rooms - Complete Architecture Document

## 1. System Overview

Voice Rooms is a drop-in audio chat feature allowing users to create/join live audio conversations with role-based permissions, hand-raise mechanics, and real-time participant management.

---

## 2. Technical Stack

### Core Technologies
- **WebRTC**: Peer-to-peer audio streaming
- **Socket.io**: Real-time signaling & room events
- **MongoDB**: Persistent room data & analytics
- **Redis**: Active session management & caching
- **Node.js**: Backend signaling server

### Optional (Phase 2)
- **mediasoup**: SFU for 50+ participant rooms
- **AWS S3**: Room recording storage
- **CloudWatch**: Real-time analytics

---

## 3. Database Schema

### Room Model
```javascript
{
  _id: ObjectId,
  title: String,              // "Late Night Coding"
  description: String,
  createdBy: ObjectId,        // User ref
  type: String,               // 'public' | 'private' | 'friends-only'
  category: String,           // 'tech' | 'music' | 'gaming' | 'casual'
  
  // Capacity & Limits
  maxParticipants: Number,    // Default: 50
  maxSpeakers: Number,        // Default: 10
  
  // Permissions
  permissions: {
    anyoneCanSpeak: Boolean,  // false = need approval
    allowRecording: Boolean,
    allowHandRaise: Boolean,
  },
  
  // Moderation
  moderators: [ObjectId],     // User refs
  bannedUsers: [ObjectId],
  
  // State
  status: String,             // 'active' | 'ended' | 'scheduled'
  startedAt: Date,
  endedAt: Date,
  scheduledFor: Date,         // Optional
  
  // Analytics
  peakParticipants: Number,
  totalJoins: Number,
  totalSpeakTime: Number,     // seconds
  
  // Metadata
  tags: [String],
  language: String,
  isRecorded: Boolean,
  recordingUrl: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

### RoomParticipant (Redis Cache)
```javascript
// Key: room:{roomId}:participants
{
  userId: String,
  role: String,               // 'host' | 'speaker' | 'listener'
  joinedAt: Number,           // timestamp
  isMuted: Boolean,
  isSpeaking: Boolean,        // VAD detection
  handRaised: Boolean,
  handRaisedAt: Number,
  lastActivity: Number,
  
  // WebRTC
  socketId: String,
  peerId: String,
}
```

### RoomAnalytics Model
```javascript
{
  roomId: ObjectId,
  date: Date,                 // Daily aggregation
  
  metrics: {
    totalParticipants: Number,
    peakConcurrent: Number,
    avgDuration: Number,      // seconds
    totalSpeakTime: Number,
    
    // Engagement
    handRaises: Number,
    speakerChanges: Number,
    messagesInChat: Number,
  },
  
  // Hourly breakdown
  hourlyData: [{
    hour: Number,             // 0-23
    participants: Number,
    speakTime: Number,
  }],
  
  topSpeakers: [{
    userId: ObjectId,
    speakTime: Number,
  }],
}
```

---

## 4. API Design

### REST Endpoints

```javascript
// Room Management
POST   /api/rooms                    // Create room
GET    /api/rooms                    // List active rooms (paginated)
GET    /api/rooms/:id                // Get room details
PATCH  /api/rooms/:id                // Update room (host only)
DELETE /api/rooms/:id                // End room (host only)

// Room Discovery
GET    /api/rooms/discover           // Recommended rooms
GET    /api/rooms/trending           // Trending by participants
GET    /api/rooms/category/:cat      // Filter by category
GET    /api/rooms/friends            // Rooms with friends

// Participation
POST   /api/rooms/:id/join           // Join room
POST   /api/rooms/:id/leave          // Leave room
POST   /api/rooms/:id/raise-hand     // Raise hand
POST   /api/rooms/:id/invite         // Invite users

// Moderation
POST   /api/rooms/:id/promote        // Listener → Speaker
POST   /api/rooms/:id/demote         // Speaker → Listener
POST   /api/rooms/:id/mute           // Mute speaker
POST   /api/rooms/:id/kick           // Remove participant
POST   /api/rooms/:id/ban            // Ban user

// Analytics
GET    /api/rooms/:id/analytics      // Room stats
GET    /api/users/me/room-history    // User's room history
```

### Socket.io Events

```javascript
// Client → Server
'room:join'              { roomId, role }
'room:leave'             { roomId }
'room:speak-request'     { roomId }
'room:hand-raise'        { roomId }
'room:hand-lower'        { roomId }
'room:mute-toggle'       { roomId, muted }

// WebRTC Signaling
'webrtc:offer'           { roomId, peerId, offer }
'webrtc:answer'          { roomId, peerId, answer }
'webrtc:ice-candidate'   { roomId, peerId, candidate }

// Server → Client
'room:state'             { participants, speakers, listeners }
'room:participant-joined'  { user, role }
'room:participant-left'    { userId }
'room:role-changed'        { userId, newRole }
'room:hand-raised'         { userId, timestamp }
'room:speaking-changed'    { userId, isSpeaking }
'room:ended'               { reason }

// Moderation Events
'room:kicked'            { reason }
'room:muted'             { by, reason }
'room:promoted'          { newRole }
```

---

## 5. WebRTC Architecture

### Connection Flow

```
1. User joins room
   ↓
2. Server assigns role (speaker/listener)
   ↓
3. If speaker:
   - Get list of existing speakers
   - Create peer connections to each
   - Exchange SDP offers/answers
   ↓
4. Audio streams flow
   ↓
5. VAD (Voice Activity Detection) updates speaking state
   ↓
6. Server broadcasts speaking status to all
```

### Peer Connection Strategy

**Small Rooms (<10 speakers): Mesh Network**
```javascript
// Each speaker connects to every other speaker
// Connections: n * (n-1) / 2
// 5 speakers = 10 connections
// 10 speakers = 45 connections
```

**Large Rooms (>10 speakers): SFU with mediasoup**
```javascript
// Each speaker sends to server
// Server forwards to all listeners
// Connections: n (linear scaling)
// 50 speakers = 50 connections
```

### Audio Quality Tiers

```javascript
const AUDIO_CONSTRAINTS = {
  low: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,
    channelCount: 1,
  },
  medium: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 24000,
    channelCount: 1,
  },
  high: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
  }
};
```

---

## 6. Scalability Considerations

### Horizontal Scaling

```javascript
// Use Redis for cross-server communication
// Each server handles subset of rooms

┌─────────┐     ┌─────────┐     ┌─────────┐
│ Server1 │────▶│  Redis  │◀────│ Server2 │
│ Rooms   │     │  PubSub │     │ Rooms   │
│ 1-100   │     └─────────┘     │ 101-200 │
└─────────┘                     └─────────┘
```

### Load Balancing Strategy

```javascript
// Sticky sessions based on roomId
// All participants of same room → same server
// Use consistent hashing for room assignment

const serverIndex = hashCode(roomId) % serverCount;
```

### Resource Limits

```javascript
const LIMITS = {
  maxRoomsPerServer: 100,
  maxParticipantsPerRoom: 50,
  maxSpeakersPerRoom: 10,
  maxRoomDuration: 12 * 60 * 60 * 1000, // 12 hours
  
  // Rate limiting
  maxRoomCreationsPerUser: 5,  // per day
  maxJoinsPerMinute: 10,       // per user
};
```

---

## 7. Security & Privacy

### Authentication
```javascript
// JWT token validation on socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyJWT(token);
  socket.userId = user._id;
  next();
});
```

### Authorization Checks
```javascript
// Before any room action
- Is user banned from room?
- Does user have required role?
- Is room at capacity?
- Is user rate-limited?
```

### Privacy Controls
```javascript
room.privacy = {
  type: 'public' | 'private' | 'friends-only',
  requireApproval: Boolean,    // Host approves joins
  hideParticipants: Boolean,   // Don't show participant list
  allowRecording: Boolean,
  allowInvites: Boolean,
};
```

---

## 8. Performance Optimizations

### 1. Lazy Loading Participants
```javascript
// Only load first 20 participants
// Load more on scroll
GET /api/rooms/:id/participants?page=1&limit=20
```

### 2. Audio Stream Optimization
```javascript
// Listeners don't send audio (save bandwidth)
// Only speakers have active peer connections
// Muted speakers pause their streams
```

### 3. Redis Caching
```javascript
// Cache active room list (TTL: 30s)
// Cache participant counts (TTL: 10s)
// Cache user permissions (TTL: 5m)
```

### 4. Database Indexing
```javascript
// Compound indexes
db.rooms.createIndex({ status: 1, createdAt: -1 });
db.rooms.createIndex({ category: 1, status: 1 });
db.rooms.createIndex({ createdBy: 1, status: 1 });
```

---

## 9. Monitoring & Analytics

### Real-time Metrics
```javascript
- Active rooms count
- Total participants across all rooms
- Average room size
- Peak concurrent users
- WebRTC connection success rate
- Audio quality metrics (packet loss, jitter)
```

### Business Metrics
```javascript
- Daily active rooms
- Average room duration
- User retention (return rate)
- Most popular categories
- Peak usage hours
```

### Error Tracking
```javascript
- WebRTC connection failures
- Socket disconnections
- Permission denied errors
- Rate limit hits
```

---

## 10. Testing Strategy

### Unit Tests
```javascript
✓ Room creation with valid/invalid data
✓ Permission checks for all actions
✓ Role transitions (listener ↔ speaker)
✓ Hand raise queue management
✓ Participant limit enforcement
```

### Integration Tests
```javascript
✓ Full join → speak → leave flow
✓ WebRTC signaling exchange
✓ Multi-user scenarios
✓ Moderation actions
✓ Room cleanup on end
```

### Load Tests
```javascript
✓ 50 users joining same room
✓ 100 concurrent rooms
✓ Rapid join/leave cycles
✓ Network interruption recovery
```

### E2E Tests
```javascript
✓ Create room → invite friend → promote to speaker
✓ Hand raise → host approves → user speaks
✓ Host kicks user → user cannot rejoin
```

---

## 11. Deployment Strategy

### Phase 1: MVP (Week 1-2)
- Basic room creation (public only)
- Join/leave functionality
- Mesh WebRTC (max 10 users)
- Simple speaker/listener roles
- No recording

### Phase 2: Core Features (Week 3-4)
- Hand raise mechanism
- Host moderation (kick, mute, promote)
- Room categories & discovery
- Private rooms
- Redis caching

### Phase 3: Scale (Week 5-6)
- SFU implementation (mediasoup)
- Support 50+ participants
- Room recording
- Analytics dashboard
- Scheduled rooms

### Phase 4: Polish (Week 7-8)
- Mobile optimization
- Background audio support
- Push notifications for invites
- Room recommendations
- Advanced moderation tools

---

## 12. Cost Estimation

### Infrastructure (Monthly)
```
- Server (4 vCPU, 8GB RAM): $40
- Redis (2GB): $15
- MongoDB Atlas (10GB): $25
- Bandwidth (1TB): $90
- CloudWatch/Monitoring: $10
─────────────────────────────
Total: ~$180/month for 1000 DAU
```

### Scaling Costs
```
- 10K DAU: ~$500/month
- 100K DAU: ~$2,500/month
- 1M DAU: ~$15,000/month
```

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| WebRTC connection failures | High | Fallback to TURN servers, retry logic |
| Server overload | High | Auto-scaling, rate limiting, room caps |
| Audio quality issues | Medium | Adaptive bitrate, quality presets |
| Abuse/spam | Medium | Moderation tools, reporting, bans |
| Privacy concerns | High | Clear permissions, encryption, compliance |

---

## 14. Future Enhancements

- **Spatial Audio**: 3D audio positioning
- **Screen Sharing**: Share screen in voice room
- **Breakout Rooms**: Split into smaller groups
- **AI Moderation**: Auto-detect toxic speech
- **Transcription**: Real-time speech-to-text
- **Translation**: Real-time language translation
- **NFT Gating**: Token-gated exclusive rooms
- **Monetization**: Paid rooms, tips for hosts

---

## 15. Success Metrics

### Engagement
- Average room duration > 20 minutes
- Return rate > 40% (users join 2nd room)
- Speaker participation > 30%

### Technical
- WebRTC success rate > 95%
- Average latency < 300ms
- Uptime > 99.5%

### Growth
- 20% MoM growth in active rooms
- 50% of users create at least 1 room
- Average 5 participants per room

