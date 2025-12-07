import rateLimit from 'express-rate-limit';

// Strict rate limiter for authentication endpoints (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for password reset (prevent abuse)
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: { message: 'Too many password reset attempts, please try again after 1 hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for AI endpoints (expensive API calls)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { message: 'Too many AI requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for message sending (prevent spam)
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: { message: 'Too many messages, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for file uploads (prevent abuse)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: { message: 'Too many uploads, please wait a moment' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for call initiation (prevent call spam)
export const callLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 call attempts per minute
  message: { message: 'Too many call attempts, please wait' },
  standardHeaders: true,
  legacyHeaders: false,
});
