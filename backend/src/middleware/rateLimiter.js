import rateLimit from 'express-rate-limit';

/**
 * Rate limiter: max 20 requests per minute per IP.
 * Guards against accidental loops and abuse.
 */
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'rate_limit',
    message: 'Too many requests. Please wait a minute before trying again.',
  },
});
