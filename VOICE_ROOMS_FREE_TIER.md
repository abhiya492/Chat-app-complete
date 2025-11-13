# 🎙️ Voice Rooms - $0 Free Tier Architecture

## 💰 Cost Breakdown - FREE Version

### What Costs Money (Original)
- ❌ Dedicated server: $40/month
- ❌ Redis hosting: $15/month
- ❌ TURN server: $50/month
- ❌ Extra bandwidth: $90/month

### FREE Alternatives ✅

| Service | Free Option | Limit | Cost |
|---------|-------------|-------|------|
| **Server** | Render.com free tier | 750h/month | $0 |
| **Database** | MongoDB Atlas free | 512MB | $0 |
| **Redis** | Upstash free tier | 10K commands/day | $0 |
| **TURN Server** | Twilio STUN/TURN | 10GB/month | $0 |
| **Bandwidth** | Cloudflare | Unlimited | $0 |

**Total Cost: $0/month** 🎉

---

## 🏗️ Free Tier Architecture

```
┌─────────────────────────────────────────┐
│  Render.com (Free)                      │
│  - 512MB RAM                            │
│  - Sleeps after 15min inactivity        │
│  - 750 hours/month                      │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  MongoDB Atlas (Free)                   │
│  - 512MB storage                        │
│  - Shared cluster                       │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Upstash Redis (Free)                   │
│  - 10K commands/day                     │
│  - 256MB storage                        │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Twilio STUN/TURN (Free)                │
│  - 10GB bandwidth/month                 │
│  - ~500 room hours                      │
└─────────────────────────────────────────┘
```

---

## 🎯 Optimizations for Free Tier

### 1. Use Mesh WebRTC Only (No SFU)
```javascript
// Peer-to-peer connections = NO server bandwidth cost
// Limit: Max 6-8 speakers per room

const LIMITS = {
  maxSpeakers: 6,        // Keep it small
  maxParticipants: 20,   // Listeners don't use bandwidth
  maxRoomDuration: 2 * 60 * 60 * 1000, // 2 hours
};
```

### 2. Skip Redis for MVP
```javascript
// Use in-memory storage (Socket.io)
// Trade-off: Lose state on server restart

const activeRooms = new Map(); // roomId -> participants
const participants = new Map(); // userId -> roomData

// No Redis needed!
```

### 3. Use Free TURN Server
```javascript
// Twilio free tier: 10GB/month
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:global.turn.twilio.com:3478',
    username: 'your-twilio-username',
    credential: 'your-twilio-credential'
  }
];
```

### 4. Aggressive Cleanup
```javascript
// Auto-end rooms after 2 hours
// Clean up inactive rooms every 5 minutes

setInterval(() => {
  activeRooms.forEach((room, roomId) => {
    const age = Date.now() - room.createdAt;
    if (age > 2 * 60 * 60 * 1000) {
      endRoom(roomId);
    }
  });
}, 5 * 60 * 1000);
```

### 5. Minimal Database Writes
```javascript
// Only save room to DB when it ends
// Keep everything in-memory during active session

socket.on('room:end', async (roomId) => {
  const room = activeRooms.get(roomId);
  
  // Save to MongoDB only once
  await Room.create({
    title: room.title,
    duration: Date.now() - room.createdAt,
    peakParticipants: room.peakCount,
  });
  
  activeRooms.delete(roomId);
});
```

---

## 📊 Free Tier Limits

### Render.com Free Tier
- ✅ 512MB RAM (enough for 10-20 concurrent rooms)
- ✅ 750 hours/month (always on if <750h)
- ⚠️ Sleeps after 15min inactivity (30s wake-up)
- ⚠️ Shared CPU (slower performance)

**Solution**: Keep server awake with cron job
```javascript
// Use cron-job.org (free) to ping every 10 minutes
// GET https://your-app.onrender.com/health
```

### MongoDB Atlas Free
- ✅ 512MB storage (~50K room records)
- ✅ Shared cluster
- ⚠️ Limited connections (100 max)

**Solution**: Use connection pooling
```javascript
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10, // Limit connections
});
```

### Upstash Redis Free
- ✅ 10K commands/day (~7 commands/minute)
- ✅ 256MB storage

**Solution**: Use only for critical data
```javascript
// Cache only active room list (not participants)
// TTL: 60 seconds

await redis.setex('active-rooms', 60, JSON.stringify(roomIds));
```

### Twilio TURN Free
- ✅ 10GB/month bandwidth
- ✅ Unlimited STUN requests

**Calculation**:
```
10GB = 10,000MB
Audio: 32kbps = 4KB/s = 240KB/min = 14.4MB/hour

10GB / 14.4MB = ~694 speaker-hours/month
= ~23 hours/day of speaking time
```

**Solution**: Prefer STUN (free) over TURN
```javascript
// STUN works for 80% of connections
// TURN only needed for strict NAT/firewalls
```

---

## 🚀 Simplified Architecture (No Redis)

```javascript
// backend/src/lib/socket.js

const activeRooms = new Map();

io.on('connection', (socket) => {
  
  socket.on('room:create', ({ title }) => {
    const roomId = generateId();
    activeRooms.set(roomId, {
      id: roomId,
      title,
      host: socket.userId,
      participants: new Map(),
      createdAt: Date.now(),
    });
    socket.emit('room:created', { roomId });
  });

  socket.on('room:join', ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) return socket.emit('error', 'Room not found');
    
    if (room.participants.size >= 20) {
      return socket.emit('error', 'Room full');
    }

    socket.join(roomId);
    room.participants.set(socket.userId, {
      userId: socket.userId,
      role: 'listener',
      joinedAt: Date.now(),
    });

    io.to(roomId).emit('room:participant-joined', {
      userId: socket.userId,
    });
  });

  socket.on('disconnect', () => {
    // Remove from all rooms
    activeRooms.forEach((room, roomId) => {
      if (room.participants.has(socket.userId)) {
        room.participants.delete(socket.userId);
        io.to(roomId).emit('room:participant-left', {
          userId: socket.userId,
        });
        
        // Delete empty rooms
        if (room.participants.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    });
  });
});
```

---

## 📉 Capacity Estimates (Free Tier)

### Render.com (512MB RAM)
```
Per room: ~25MB RAM
512MB / 25MB = ~20 concurrent rooms
```

### Twilio TURN (10GB/month)
```
Per speaker: 14.4MB/hour
10GB / 14.4MB = 694 speaker-hours/month
= ~23 hours/day total speaking time
```

### MongoDB Atlas (512MB)
```
Per room record: ~10KB
512MB / 10KB = ~50,000 room records
```

### Upstash Redis (10K commands/day)
```
Per room join: ~5 commands
10K / 5 = 2,000 room joins/day
```

**Realistic Capacity**:
- 10-15 concurrent rooms
- 100-150 daily active users
- 500 room joins/day

---

## 🎯 Free Tier Strategy

### Phase 1: Launch (Month 1-2)
- Use 100% free services
- Limit: 6 speakers per room
- No Redis (in-memory only)
- Target: 100 DAU

### Phase 2: Validate (Month 3-4)
- Still free tier
- Optimize performance
- Gather user feedback
- Target: 500 DAU

### Phase 3: Scale (Month 5+)
- If successful, upgrade to paid
- Add Redis ($15/month)
- Increase limits
- Target: 1000+ DAU

---

## 💡 Pro Tips for Free Tier

### 1. Keep Server Awake
```bash
# Use cron-job.org (free)
# Ping every 10 minutes: GET /health
```

### 2. Optimize Bundle Size
```javascript
// Reduce frontend bundle = faster cold starts
// Use code splitting
const RoomView = lazy(() => import('./RoomView'));
```

### 3. Lazy Load Audio
```javascript
// Don't initialize WebRTC until user joins room
// Saves memory for inactive users
```

### 4. Aggressive Timeouts
```javascript
// End rooms after 2 hours
// Kick inactive users after 10 minutes
```

### 5. Monitor Usage
```javascript
// Track free tier limits
console.log('Active rooms:', activeRooms.size);
console.log('RAM usage:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
```

---

## 🚨 When to Upgrade

### Upgrade to Paid ($20/month) if:
- ✅ 500+ daily active users
- ✅ 50+ concurrent rooms
- ✅ Users complaining about performance
- ✅ Hitting free tier limits

### What to Upgrade First:
1. **Server** ($7/month) - More RAM, no sleep
2. **Redis** ($15/month) - Better state management
3. **TURN** ($50/month) - More bandwidth

---

## ✅ Free Tier Checklist

- [ ] Render.com account created
- [ ] MongoDB Atlas free cluster setup
- [ ] Upstash Redis free account (optional)
- [ ] Twilio account for TURN credentials
- [ ] Cron job to keep server awake
- [ ] Monitoring for free tier limits
- [ ] Room limits enforced (6 speakers max)
- [ ] Auto-cleanup for old rooms

---

## 🎉 Summary

**You can build Voice Rooms for $0/month!**

**Trade-offs**:
- ⚠️ Max 6 speakers per room (vs 50)
- ⚠️ 10-15 concurrent rooms (vs 100)
- ⚠️ Server sleeps after 15min (30s wake-up)
- ⚠️ 100-150 DAU capacity (vs 1000)

**Benefits**:
- ✅ Zero cost to launch
- ✅ Validate idea before spending
- ✅ Easy to upgrade later
- ✅ Same features, just smaller scale

**Perfect for**: MVP, testing, small communities, side projects

Ready to build the free version? 🚀
