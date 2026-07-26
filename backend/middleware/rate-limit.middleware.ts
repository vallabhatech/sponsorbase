import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Initialize Redis client
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
let redisClient: Redis | null = null;
let store: RedisStore | undefined;

try {
  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      // Don't retry endlessly in dev/test if Redis is down
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    }
  });

  redisClient.on('error', (err) => {
    console.warn('Redis connection error in rate-limit middleware, falling back to memory store:', err.message);
  });

  store = new RedisStore({
    // @ts-ignore
    sendCommand: (...args: string[]) => redisClient!.call(args[0], ...args.slice(1))
  });
} catch (error) {
  console.warn('Could not initialize Redis, using memory store for rate limiting');
}

// Helper to determine rate limit key
const keyGenerator = (req: Request): string => {
  // If user is authenticated, rate limit by userId, else by IP
  const user = (req as any).user;
  return user?.userId ? `limit:user:${user.userId}` : `limit:ip:${req.ip}`;
};

// 1. Auth Endpoint Rate Limiter (strict: 10 requests per 15 minutes)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  store,
  message: {
    error: 'Too Many Requests',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

// 2. Search Endpoint Rate Limiter (100 requests per 1 minute)
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  store,
  message: {
    error: 'Too Many Requests',
    message: 'Search rate limit exceeded. Please wait a minute before searching again.'
  }
});

// 3. Submissions Endpoint Rate Limiter (5 requests per 1 hour)
export const submissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  store,
  message: {
    error: 'Too Many Requests',
    message: 'Submission rate limit exceeded. You can only submit 5 sponsors per hour.'
  }
});

// 4. Global Endpoint Rate Limiter (500 requests per 15 minutes)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  store,
  message: {
    error: 'Too Many Requests',
    message: 'Global rate limit exceeded.'
  }
});
