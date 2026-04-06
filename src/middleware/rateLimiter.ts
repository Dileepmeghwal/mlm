import { Request, Response, NextFunction } from 'express';

/**
 * In-memory store for rate limiting
 * In production, use Redis for distributed rate limiting across multiple servers
 */
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

/**
 * Rate limiting middleware
 * @param key - Unique identifier for this rate limit rule
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in seconds
 */
export function rateLimitMiddleware(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP address as identifier (X-Forwarded-For for proxied requests)
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';

      const rateLimitKey = `${key}:${clientIp}`;
      const now = Date.now();

      // Get current limit data
      let limitData = rateLimitStore.get(rateLimitKey);

      // Reset if window has expired
      if (!limitData || now > limitData.resetTime) {
        limitData = {
          count: 0,
          resetTime: now + windowMs * 1000
        };
      }

      // Increment request count
      limitData.count++;
      rateLimitStore.set(rateLimitKey, limitData);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - limitData.count));
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(limitData.resetTime / 1000)
      );

      // Check if exceeded
      if (limitData.count > maxRequests) {
        const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);
        res.setHeader('Retry-After', retryAfter);

        res.status(429).json({
          success: false,
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          retryAfter
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Allow request to proceed on error
    }
  };
}

/**
 * Clean up old entries from rate limit store (run periodically)
 * Call this every hour or so to prevent memory leaks
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  console.log(`Rate limit store cleanup: removed ${cleanedCount} entries`);
}

// Cleanup every 10 minutes
setInterval(cleanupRateLimitStore, 10 * 60 * 1000);

export default rateLimitMiddleware;
