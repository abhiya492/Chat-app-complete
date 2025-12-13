# 🎙️ Voice Rooms - Technical Decisions & Trade-offs

## Critical Architecture Decisions

### Decision 1: WebRTC Topology

| Option | Complexity | Cost | Scalability | Latency | Best For |
|--------|-----------|------|-------------|---------|----------|
| **Mesh (P2P)** | Low | Free | Poor (4-8 users) | Lowest | MVP, small groups |
| **SFU** | Medium | Medium | Good (50+ users) | Low | Production ✅ |
| **MCU** | High | High | Excellent | Medium | Enterprise webinars |

**Decision: Start with Mesh, migrate to SFU**

**Reasoning**:
- Mesh is simpler to implement (no media server)
- Covers 80% of use cases (small friend groups)
- Can add SFU later without frontend changes
- Saves infrastructure costs during testing phase

**Migration Path**:
```javascript
// Abstract WebRTC logic behind interface
class AudioConnectionManager {
  async connect(strategy = 'mesh') {
    if (strategy === 'mesh') {
      return new MeshConnection();
    } else if (strategy === 'sfu') {
      return new SFUConnection();
    }
  }
}

// Backend decides strategy based on room size
if (participantCount > 10) {
  strategy = 'sfu';
}
```

---

### Decision 2: State Management

| Layer | Technology | Purpose | TTL | Why |
|-------|-----------|---------|-----|-----|
| **Persistent** | MongoDB | Room metadata, history | Forever | Queryable, relational |
| **Cache** | Redis | Active participants | 24h | Fast lookups, pub/sub |
| **Ephemeral** | Socket.io | WebRTC signals | N/A | Real-time, temporary |

**Decision: Three-tier state management** ✅

**Reasoning**:
- MongoDB: Slow but reliable for historical data
- Redis: Fast for active session data, auto-cleanup
- Socket.io: Perfect for transient WebRTC signals

**Example Flow**:
```
User joins room
  ↓
1. Check MongoDB: Does room exist? Is user banned?
  ↓
2. Add to Redis: Track active participant
  ↓
3. Socket.io: Broadcast join event
  ↓
4. WebRTC: Exchange offers/answers (ephemeral)
```

---

### Decision 3: Audio Quality vs Bandwidth

| Quality | Bitrate | Bandwidth (10 speakers) | Use Case |
|---------|---------|------------------------|----------|
| **Low** | 16 kbps | 160 kbps | Mobile, poor network |
| **Medium** | 32 kbps | 320 kbps | Default ✅ |
| **High** | 64 kbps | 640 kbps | Music, podcasts |

**Decision: Adaptive quality with 32 kbps default** ✅

**Reasoning**:
- 32 kbps is good enough for voice
- Saves bandwidth for mobile users
- Can upgrade to 64 kbps for "music mode"

**Implementation**:
```javascript
const constraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: room.audioQuality === 'high' ? 48000 : 24000,
  }
};

// Detect network quality and adjust
connection.addEventListener('iceconnectionstatechange', () => {
  if (connection.iceConnectionState === 'checking') {
    // Monitor packet loss
    const stats = await connection.getStats();
    if (stats.packetsLost > 5%) {
      downgradeQuality();
    }
  }
});
```

---

### Decision 4: Moderation Model

| Model | Pros | Cons | Best For |
|-------|------|------|----------|
| **Host-only** | Simple, clear authority | Bottleneck | Small rooms |
| **Moderators** | Distributed control | Complex permissions | Large rooms ✅ |
| **Democratic** | Fair, community-driven | Slow, chaotic | Casual spaces |

**Decision: Host + Moderators** ✅

**Reasoning**:
- Host has ultimate control (can end room)
- Moderators can handle day-to-day (kick, mute)
- Scales better than host-only
- Clear hierarchy prevents chaos

**Permission Matrix**:
```javascript
const PERMISSIONS = {
  host: [
    'end_room',
    'add_moderator',
    'remove_moderator',
    'kick',
    'ban',
    'mute',
    'promote',
    'demote',
    'change_settings'
  ],
  moderator: [
    'kick',
    'mute',
    'promote',
    'demote'
  ],
  speaker: [
    'speak',
    'mute_self'
  ],
  listener: [
    'raise_hand',
    'leave'
  ]
};
```

---

### Decision 5: Room Discovery Algorithm

**Options**:
1. **Chronological**: Newest first
2. **Popular**: Most participants
3. **Trending**: Fastest growth
4. **Personalized**: ML recommendations

**Decision: Hybrid approach** ✅

```javascript
// Scoring algorithm
function calculateRoomScore(room, user) {
  let score = 0;
  
  // Recency (0-30 points)
  const ageMinutes = (Date.now() - room.createdAt) / 60000;
  score += Math.max(0, 30 - ageMinutes);
  
  // Popularity (0-40 points)
  const participantRatio = room.currentParticipants / room.maxParticipants;
  score += participantRatio * 40;
  
  // Engagement (0-20 points)
  const avgDuration = room.totalSpeakTime / room.totalJoins;
  score += Math.min(20, avgDuration / 60); // Cap at 20 minutes
  
  // Personalization (0-10 points)
  if (room.category === user.favoriteCategory) score += 5;
  if (room.participants.some(p => user.friends.includes(p))) score += 5;
  
  return score;
}

// Sort rooms by score
rooms.sort((a, b) => calculateRoomScore(b, user) - calculateRoomScore(a, user));
```

---

### Decision 6: Scaling Strategy

**Vertical vs Horizontal Scaling**

| Approach | Cost | Complexity | Max Capacity | Downtime Risk |
|----------|------|-----------|--------------|---------------|
| **Vertical** | High | Low | Limited | High |
| **Horizontal** | Medium | High | Unlimited | Low ✅ |

**Decision: Horizontal scaling with sticky sessions** ✅

**Architecture**:
```
                    ┌─────────────┐
                    │ Load Balancer│
                    │ (Sticky)     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ Server1 │        │ Server2 │        │ Server3 │
   │ Rooms   │        │ Rooms   │        │ Rooms   │
   │ 1-100   │        │ 101-200 │        │ 201-300 │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   (Shared)  │
                    └─────────────┘
```

**Sticky Session Logic**:
```javascript
// Consistent hashing based on roomId
function getServerForRoom(roomId, serverCount) {
  const hash = hashCode(roomId);
  return hash % serverCount;
}

// All participants of same room → same server
// Ensures WebRTC connections stay on one server
```

---

### Decision 7: Mobile Strategy

**Options**:
1. **Web-only**: PWA with responsive design
2. **Hybrid**: React Native wrapper
3. **Native**: Separate iOS/Android apps

**Decision: Start with PWA, evaluate native later** ✅

**Reasoning**:
- WebRTC works in mobile browsers (iOS 14.3+, Android Chrome)
- PWA can run in background (with limitations)
- Faster to market
- Single codebase

**Mobile Optimizations**:
```javascript
// Detect mobile and adjust
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Lower audio quality
  audioConstraints.sampleRate = 16000;
  
  // Reduce UI complexity
  showSimplifiedControls();
  
  // Handle background audio
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Keep audio running
      keepAudioActive();
    }
  });
}
```

---

### Decision 8: Privacy & Compliance

**GDPR/Privacy Considerations**:

| Feature | Privacy Impact | Mitigation |
|---------|---------------|------------|
| **Recording** | High | Explicit consent, indicator |
| **Participant List** | Medium | Privacy setting to hide |
| **Transcription** | High | Opt-in only |
| **Analytics** | Low | Anonymize user data |

**Decision: Privacy-first with opt-in** ✅

**Implementation**:
```javascript
// Before joining room
if (room.isRecorded && !user.consentedToRecording) {
  showConsentModal({
    message: "This room is being recorded. Continue?",
    onAccept: () => joinRoom(),
    onDecline: () => goBack()
  });
}

// Privacy settings
user.privacy = {
  showInParticipantList: true,    // Can hide from list
  allowRecordingMyVoice: false,   // Opt-in for recording
  shareActivityStatus: true,      // "In a voice room"
};
```

---

### Decision 9: Error Handling Strategy

**WebRTC Connection Failures**:

```javascript
class RobustWebRTCConnection {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  async connect() {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        await this.attemptConnection();
        return;
      } catch (error) {
        console.error(`Connection attempt ${i + 1} failed:`, error);
        
        if (i < this.maxRetries - 1) {
          await this.sleep(this.retryDelay * (i + 1)); // Exponential backoff
        } else {
          // Final fallback: TURN server
          await this.connectViaTURN();
        }
      }
    }
  }

  async connectViaTURN() {
    // Use TURN server for NAT traversal
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
    // ... connection logic
  }
}
```

---

### Decision 10: Monetization Strategy (Future)

**Options**:
1. **Freemium**: Free basic, paid premium rooms
2. **Tipping**: Users tip room hosts
3. **Subscriptions**: Monthly fee for unlimited rooms
4. **Ads**: Audio ads between rooms (bad UX)

**Decision: Freemium + Tipping** ✅

**Reasoning**:
- Freemium aligns with user expectations
- Tipping rewards good hosts
- Ads would ruin experience
- Subscriptions too early

**Pricing Tiers**:
```javascript
const PLANS = {
  free: {
    maxRoomDuration: 60 * 60 * 1000,      // 1 hour
    maxParticipants: 10,
    canRecord: false,
    canSchedule: false,
  },
  premium: {
    price: 9.99,                          // per month
    maxRoomDuration: 12 * 60 * 60 * 1000, // 12 hours
    maxParticipants: 50,
    canRecord: true,
    canSchedule: true,
    customBranding: true,
  }
};
```

---

## Risk Assessment Matrix

| Risk | Probability | Impact | Mitigation | Priority |
|------|------------|--------|------------|----------|
| **WebRTC fails on some networks** | High | High | TURN servers, fallback | P0 |
| **Server overload** | Medium | High | Auto-scaling, rate limits | P0 |
| **Audio quality issues** | Medium | Medium | Adaptive bitrate, testing | P1 |
| **Abuse/harassment** | Medium | High | Moderation tools, reporting | P1 |
| **Privacy violations** | Low | Critical | Clear consent, compliance | P0 |
| **High infrastructure costs** | Medium | Medium | Optimize, monitor usage | P2 |

---

## Success Criteria

### Technical Metrics
- ✅ WebRTC connection success rate > 95%
- ✅ Average audio latency < 300ms
- ✅ Room join time < 500ms
- ✅ Uptime > 99.5%
- ✅ CPU usage per room < 5%

### User Metrics
- ✅ Average room duration > 20 minutes
- ✅ Return rate > 40% (join 2nd room)
- ✅ Speaker participation > 30%
- ✅ NPS score > 50

### Business Metrics
- ✅ 20% MoM growth in active rooms
- ✅ 50% of users create at least 1 room
- ✅ Average 5 participants per room
- ✅ Infrastructure cost < $0.10 per user/month

---

## When to Pivot

**Red Flags**:
1. WebRTC success rate < 80% after 2 weeks
2. Average room duration < 5 minutes
3. Infrastructure costs > $1 per user/month
4. Frequent abuse reports (> 10% of rooms)

**Pivot Options**:
- Switch to pre-recorded audio rooms (async)
- Focus on 1-on-1 calls instead of groups
- Add video to increase engagement
- Niche down to specific use case (e.g., study rooms)

---

## Conclusion

This architecture balances:
- ✅ **Simplicity**: Start with mesh, add complexity later
- ✅ **Scalability**: Horizontal scaling, Redis caching
- ✅ **Cost**: Optimize for low infrastructure spend
- ✅ **UX**: Fast joins, low latency, intuitive controls
- ✅ **Privacy**: Consent-based, GDPR compliant

**Estimated Timeline**: 12 days for MVP
**Estimated Cost**: $180/month for 1000 DAU
**Team Size**: 1-2 developers

Ready to implement? Let's start with Phase 1! 🚀
