import Redis from 'ioredis';

let redis = null;

const initRedis = () => {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) return true;
        return false;
      }
    });

    redis.on('error', (err) => console.error('Redis error:', err));
    redis.on('connect', () => console.log('Redis connected'));
  }
  return redis;
};

export const cache = {
  get: async (key) => {
    const client = initRedis();
    if (!client) return null;
    try {
      return await client.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  set: async (key, value, ttl = 3600) => {
    const client = initRedis();
    if (!client) return false;
    try {
      await client.setex(key, ttl, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  del: async (key) => {
    const client = initRedis();
    if (!client) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  },

  exists: async (key) => {
    const client = initRedis();
    if (!client) return false;
    try {
      return await client.exists(key) === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }
};
