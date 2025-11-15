/**
 * Rate Limiting Utility
 * Implements in-memory rate limiting for API routes
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the time window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval - remove expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // GDPR endpoints - stricter limits
  GDPR_EXPORT: { interval: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  GDPR_DELETE: { interval: 24 * 60 * 60 * 1000, maxRequests: 1 }, // 1 per day

  // Webhook endpoints - higher limits
  WEBHOOK: { interval: 60 * 1000, maxRequests: 100 }, // 100 per minute

  // Admin endpoints - moderate limits
  ADMIN_IMPERSONATE: { interval: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour

  // Interview endpoints - moderate limits
  INTERVIEW: { interval: 60 * 1000, maxRequests: 30 }, // 30 per minute

  // Default rate limit
  DEFAULT: { interval: 60 * 1000, maxRequests: 60 }, // 60 per minute
};

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier for rate limiting (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry exists - create new one
  if (!entry) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.interval,
    };
  }

  // Entry exists but expired - reset counter
  if (entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.interval,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.interval,
    };
  }

  // Entry exists and not expired - check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000), // Seconds until reset
    };
  }

  // Increment counter
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit identifier from request
 * Prefers userId, falls back to IP address
 */
export function getRateLimitIdentifier(
  userId?: string,
  ipAddress?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }

  if (ipAddress) {
    return `ip:${ipAddress}`;
  }

  return "anonymous";
}

/**
 * Extract IP address from request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}
