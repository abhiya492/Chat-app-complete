# 🛡️ Rate Limiting Implementation

## Overview
Rate limiting has been implemented across the application to prevent abuse, protect against DDoS attacks, and ensure fair resource usage.

---

## 📊 Rate Limit Configuration

### 1. **Authentication Routes** (`/api/auth`)

#### Login & Signup
- **Limit**: 5 requests per 15 minutes
- **Purpose**: Prevent brute force attacks
- **Routes**:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`

#### Password Reset
- **Limit**: 3 requests per hour
- **Purpose**: Prevent password reset abuse
- **Routes**:
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

---

### 2. **AI Routes** (`/api/ai`)

- **Limit**: 10 requests per minute
- **Purpose**: Prevent expensive API abuse (Groq API costs)
- **Routes**:
  - `POST /api/ai/smart-replies`
  - `POST /api/ai/translate`
  - `POST /api/ai/detect-spam`
  - `POST /api/ai/moderate`
  - `POST /api/ai/sentiment`
  - `POST /api/ai/chatbot`

---

### 3. **Message Routes** (`/api/messages`)

#### Message Sending
- **Limit**: 30 messages per minute
- **Purpose**: Prevent message spam
- **Routes**:
  - `POST /api/messages/send/:id`
  - `POST /api/messages/forward/:messageId`

---

### 4. **Call Routes** (`/api/calls`)

- **Limit**: 5 call attempts per minute
- **Purpose**: Prevent call spam
- **Routes**:
  - `POST /api/calls/initiate`

---

### 5. **General API Routes**

- **Limit**: 100 requests per 15 minutes
- **Purpose**: Baseline protection for all API endpoints
- **Applies to**: All `/api/*` routes

---

## 🔌 Socket.io Rate Limiting

### Real-Time Event Limits

| Event | Limit | Window | Purpose |
|-------|-------|--------|---------|
| `typing` | 10 | 10 seconds | Prevent typing indicator spam |
| `game:move` | 30 | 1 minute | Prevent game move flooding |
| `cursor:move` | 100 | 1 second | Allow smooth cursor tracking |
| `random:message` | 20 | 1 minute | Prevent random chat spam |
| `game:invite` | 5 | 1 minute | Prevent game invite spam |
| `call:offer` | 5 | 1 minute | Prevent call spam |
| `room:join` | 10 | 1 minute | Prevent room join flooding |

---

## 🏗️ Implementation Details

### HTTP Rate Limiting
Uses `express-rate-limit` package with the following features:
- **In-memory store** (suitable for single-server deployments)
- **Standard headers** (RateLimit-* headers in response)
- **Custom error messages** for better UX

### Socket.io Rate Limiting
Custom implementation with:
- **Per-user tracking** (userId-based limits)
- **Per-event limits** (different limits for different events)
- **Automatic cleanup** (removes old entries every 5 minutes)
- **Memory efficient** (Map-based storage)

---

## 📝 Files Modified

### New Files
1. `/backend/src/middleware/rateLimiter.middleware.js` - HTTP rate limiters
2. `/backend/src/middleware/socketRateLimiter.middleware.js` - Socket rate limiter

### Modified Files
1. `/backend/src/routes/auth.route.js` - Auth rate limiting
2. `/backend/src/routes/ai.route.js` - AI rate limiting
3. `/backend/src/routes/message.route.js` - Message rate limiting
4. `/backend/src/routes/call.route.js` - Call rate limiting
5. `/backend/src/index.js` - General API rate limiting
6. `/backend/src/lib/socket.js` - Socket event rate limiting

---

## 🧪 Testing Rate Limits

### Test Authentication Rate Limit
```bash
# Try logging in 6 times within 15 minutes
for i in {1..6}; do
  curl -X POST http://localhost:5001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nAttempt $i"
done
```

### Test AI Rate Limit
```bash
# Try making 11 AI requests within 1 minute
for i in {1..11}; do
  curl -X POST http://localhost:5001/api/ai/chatbot \
    -H "Content-Type: application/json" \
    -H "Cookie: jwt=YOUR_TOKEN" \
    -d '{"message":"Hello"}'
  echo "\nRequest $i"
done
```

### Test Message Rate Limit
```bash
# Try sending 31 messages within 1 minute
for i in {1..31}; do
  curl -X POST http://localhost:5001/api/messages/send/USER_ID \
    -H "Content-Type: application/json" \
    -H "Cookie: jwt=YOUR_TOKEN" \
    -d '{"text":"Test message"}'
  echo "\nMessage $i"
done
```

---

## 📊 Response Headers

When rate limited, responses include:
```
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1234567890
```

---

## ⚠️ Error Responses

### HTTP Rate Limit Exceeded
```json
{
  "message": "Too many attempts, please try again after 15 minutes"
}
```
**Status Code**: 429 (Too Many Requests)

### Socket Rate Limit Exceeded
```json
{
  "message": "Too many game invites"
}
```
**Event**: `error` or specific error event

---

## 🔧 Customization

### Adjust HTTP Rate Limits
Edit `/backend/src/middleware/rateLimiter.middleware.js`:

```javascript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Change window
  max: 5, // Change max requests
  message: { message: 'Custom message' },
});
```

### Adjust Socket Rate Limits
Edit `/backend/src/middleware/socketRateLimiter.middleware.js`:

```javascript
export const SOCKET_LIMITS = {
  'typing': { max: 20, window: 10000 }, // Increase limit
};
```

---

## 🚀 Production Considerations

### For Multi-Server Deployments
Replace in-memory store with Redis:

```bash
npm install rate-limit-redis
```

```javascript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

export const authLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

### For Socket.io with Redis
Use Redis adapter for distributed rate limiting:

```javascript
import { createAdapter } from '@socket.io/redis-adapter';

io.adapter(createAdapter(pubClient, subClient));
```

---

## 📈 Monitoring

### Log Rate Limit Hits
Add logging to track abuse:

```javascript
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.log(`Rate limit exceeded: ${req.ip} on ${req.path}`);
    res.status(429).json({ message: 'Too many requests' });
  },
});
```

### Track Socket Rate Limits
```javascript
if (!socketRateLimiter.checkLimit(userId, event, max, window)) {
  console.log(`Socket rate limit: ${userId} on ${event}`);
  return;
}
```

---

## ✅ Benefits

1. **Security**: Prevents brute force attacks on authentication
2. **Cost Control**: Limits expensive AI API calls
3. **Performance**: Prevents server overload from spam
4. **Fair Usage**: Ensures resources are shared fairly
5. **DDoS Protection**: Mitigates denial-of-service attacks

---

## 🎯 Best Practices

1. **Different limits for different endpoints** - Critical endpoints have stricter limits
2. **User-friendly error messages** - Clear feedback on why request was blocked
3. **Appropriate time windows** - Balance security with user experience
4. **Monitor and adjust** - Track rate limit hits and adjust as needed
5. **Consider user context** - Authenticated users may have higher limits

---

## 📚 References

- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [OWASP Rate Limiting Guide](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)
- [Socket.io Best Practices](https://socket.io/docs/v4/performance-tuning/)

---

**✅ Rate limiting is now fully implemented and protecting your application!**
