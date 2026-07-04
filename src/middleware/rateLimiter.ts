import { Request, Response, NextFunction } from 'express';
import mongoose, { Schema } from 'mongoose';

/**
 * Serverless-safe rate limiting backed by MongoDB.
 *
 * The previous implementation used an in-process Map + setInterval, which does
 * NOT work on serverless platforms (Vercel): each invocation gets a fresh,
 * isolated process, so the counter never accumulates across requests and the
 * setInterval cleanup never runs reliably. That made the limiter effectively a
 * no-op in production.
 *
 * This version stores counters in a shared MongoDB collection so all
 * invocations see the same state. Expired windows are reclaimed automatically
 * by a TTL index (no cleanup job needed). Uses the existing Mongo connection —
 * no extra infrastructure or credentials. For very high-throughput endpoints a
 * dedicated store (Redis/Upstash) would be faster, but the endpoints guarded
 * here (login, signup, password-reset, OTP) are low-volume auth flows where a
 * single indexed upsert per request is negligible.
 */

interface RateLimitDoc {
  _id: string; // `${key}:${clientIp}`
  count: number;
  resetTime: Date;
}

const rateLimitSchema = new Schema<RateLimitDoc>(
  {
    _id: { type: String },
    count: { type: Number, default: 0 },
    resetTime: { type: Date, required: true },
  },
  { versionKey: false }
);

// TTL index: Mongo auto-deletes a document once its resetTime is in the past
// (expireAfterSeconds: 0 means "expire at the resetTime value"). This replaces
// the old setInterval-based cleanup and prevents unbounded growth.
rateLimitSchema.index({ resetTime: 1 }, { expireAfterSeconds: 0 });

// Guard against model recompilation on hot-reload / warm serverless containers.
const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<RateLimitDoc>) ||
  mongoose.model<RateLimitDoc>('RateLimit', rateLimitSchema);

/**
 * Rate limiting middleware (fixed window).
 * @param key - Unique identifier for this rate limit rule
 * @param maxRequests - Maximum number of requests allowed per window
 * @param windowMs - Time window in SECONDS (name kept for backwards compat)
 */
export function rateLimitMiddleware(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use IP address as identifier (X-Forwarded-For for proxied requests).
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';

      const rateLimitKey = `${key}:${clientIp}`;
      const now = new Date();
      const newResetTime = new Date(now.getTime() + windowMs * 1000);

      // Single atomic upsert. The aggregation-pipeline form lets us conditionally
      // either (a) increment the count if the window is still active, or
      // (b) start a fresh window (count = 1) if it expired / didn't exist —
      // all in one round-trip, so concurrent invocations can't lose updates.
      const doc = await RateLimitModel.findOneAndUpdate(
        { _id: rateLimitKey },
        [
          {
            $set: {
              count: {
                $cond: [
                  { $gt: ['$resetTime', now] },
                  { $add: [{ $ifNull: ['$count', 0] }, 1] },
                  1,
                ],
              },
              resetTime: {
                $cond: [{ $gt: ['$resetTime', now] }, '$resetTime', newResetTime],
              },
            },
          },
        ],
        { upsert: true, new: true }
      ).lean();

      const count = doc?.count ?? 1;
      const resetTimeMs = doc?.resetTime
        ? new Date(doc.resetTime).getTime()
        : newResetTime.getTime();

      // Set rate limit headers.
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTimeMs / 1000));

      // Check if exceeded.
      if (count > maxRequests) {
        const retryAfter = Math.max(0, Math.ceil((resetTimeMs - now.getTime()) / 1000));
        res.setHeader('Retry-After', retryAfter);

        res.status(429).json({
          success: false,
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        });
        return;
      }

      next();
    } catch (error) {
      // Fail-open: if the store is briefly unavailable we prefer to serve the
      // request rather than lock users out of auth. Errors are logged for
      // monitoring. (Matches the previous behaviour.)
      console.error('Rate limiter error:', error);
      next();
    }
  };
}

export default rateLimitMiddleware;
