import Redis from 'ioredis';

class CacheService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.redis.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  // Generic cache methods
  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.redis.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // User-specific cache methods
  async cacheUser(userId, userData) {
    return this.set(`user:${userId}`, userData, 1800); // 30 minutes
  }

  async getCachedUser(userId) {
    return this.get(`user:${userId}`);
  }

  async invalidateUser(userId) {
    await this.del(`user:${userId}`);
    await this.del(`contacts:${userId}`);
    await this.del(`sidebar:${userId}`);
  }

  // Message cache methods
  async cacheMessages(chatId, messages) {
    return this.set(`messages:${chatId}`, messages, 600); // 10 minutes
  }

  async getCachedMessages(chatId) {
    return this.get(`messages:${chatId}`);
  }

  async invalidateMessages(chatId) {
    await this.del(`messages:${chatId}`);
  }

  // Contact cache methods
  async cacheContacts(userId, contacts) {
    return this.set(`contacts:${userId}`, contacts, 1800); // 30 minutes
  }

  async getCachedContacts(userId) {
    return this.get(`contacts:${userId}`);
  }

  async invalidateContacts(userId) {
    await this.del(`contacts:${userId}`);
  }

  // Sidebar users cache
  async cacheSidebarUsers(userId, users) {
    return this.set(`sidebar:${userId}`, users, 300); // 5 minutes
  }

  async getCachedSidebarUsers(userId) {
    return this.get(`sidebar:${userId}`);
  }

  // Online users cache
  async cacheOnlineUsers(users) {
    return this.set('online:users', users, 60); // 1 minute
  }

  async getCachedOnlineUsers() {
    return this.get('online:users');
  }

  // Search results cache
  async cacheSearchResults(query, results) {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.set(key, results, 300); // 5 minutes
  }

  async getCachedSearchResults(query) {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.get(key);
  }

  // Rate limiting
  async checkRateLimit(key, limit, window) {
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, window);
      }
      return current <= limit;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
  }

  // Session management
  async cacheSession(sessionId, data) {
    return this.set(`session:${sessionId}`, data, 86400); // 24 hours
  }

  async getCachedSession(sessionId) {
    return this.get(`session:${sessionId}`);
  }

  async invalidateSession(sessionId) {
    return this.del(`session:${sessionId}`);
  }

  // Bulk operations
  async mget(keys) {
    try {
      const values = await this.redis.mget(keys);
      return values.map(v => v ? JSON.parse(v) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  async mset(keyValuePairs, ttl = 3600) {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of keyValuePairs) {
        pipeline.setex(key, ttl, JSON.stringify(value));
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Pattern-based deletion
  async deletePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  // Health check
  async ping() {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping error:', error);
      return false;
    }
  }

  // Close connection
  async disconnect() {
    await this.redis.disconnect();
  }
}

export default new CacheService();