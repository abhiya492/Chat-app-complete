// Socket.io rate limiter to prevent event flooding
class SocketRateLimiter {
  constructor() {
    this.limits = new Map(); // userId -> { event -> { count, resetTime } }
  }

  // Check if user exceeded rate limit for specific event
  checkLimit(userId, event, maxRequests, windowMs) {
    const now = Date.now();
    
    if (!this.limits.has(userId)) {
      this.limits.set(userId, new Map());
    }
    
    const userLimits = this.limits.get(userId);
    
    if (!userLimits.has(event)) {
      userLimits.set(event, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    const limit = userLimits.get(event);
    
    // Reset if window expired
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return true;
    }
    
    // Check if limit exceeded
    if (limit.count >= maxRequests) {
      return false;
    }
    
    limit.count++;
    return true;
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    this.limits.forEach((userLimits, userId) => {
      userLimits.forEach((limit, event) => {
        if (now > limit.resetTime) {
          userLimits.delete(event);
        }
      });
      if (userLimits.size === 0) {
        this.limits.delete(userId);
      }
    });
  }
}

export const socketRateLimiter = new SocketRateLimiter();

// Cleanup every 5 minutes
setInterval(() => socketRateLimiter.cleanup(), 5 * 60 * 1000);

// Rate limit configurations for different socket events
export const SOCKET_LIMITS = {
  'typing': { max: 10, window: 10000 }, // 10 per 10 seconds
  'game:move': { max: 30, window: 60000 }, // 30 per minute
  'cursor:move': { max: 100, window: 1000 }, // 100 per second
  'random:message': { max: 20, window: 60000 }, // 20 per minute
  'game:invite': { max: 5, window: 60000 }, // 5 per minute
  'call:offer': { max: 5, window: 60000 }, // 5 per minute
  'room:join': { max: 10, window: 60000 }, // 10 per minute
};
