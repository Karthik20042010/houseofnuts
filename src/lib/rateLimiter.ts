/**
 * Client-Side Rate Limiter & Anti-Brute-Force Guard
 * Prevents malicious actors and automated bots from spamming API endpoints.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
  lockoutUntil?: number;
}

const rateLimitStore: Record<string, RateLimitRecord> = {};

/**
 * Checks if an action key has exceeded rate limits.
 * @param key Identifier for the action (e.g., 'admin_login', 'place_order')
 * @param maxAttempts Max allowed attempts within window
 * @param windowMs Time window in milliseconds (e.g., 60,000 for 1 min)
 * @param lockoutMs Lockout duration if limit exceeded (e.g., 15 mins)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60 * 1000,
  lockoutMs = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds?: number; error?: string } {
  const now = Date.now();
  let record = rateLimitStore[key];

  if (!record) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitStore[key] = record;
    return { allowed: true };
  }

  // Check if currently locked out
  if (record.lockoutUntil && now < record.lockoutUntil) {
    const remainingSec = Math.ceil((record.lockoutUntil - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: remainingSec,
      error: `Too many attempts. Locked out for security. Try again in ${remainingSec} seconds.`,
    };
  }

  // Reset window if expired
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    delete record.lockoutUntil;
    return { allowed: true };
  }

  // Increment count
  record.count += 1;

  if (record.count > maxAttempts) {
    record.lockoutUntil = now + lockoutMs;
    const remainingSec = Math.ceil(lockoutMs / 1000);
    return {
      allowed: false,
      retryAfterSeconds: remainingSec,
      error: `Rate limit exceeded (${maxAttempts} attempts max). Locked out for ${Math.round(lockoutMs / 60000)} minutes.`,
    };
  }

  return { allowed: true };
}

/**
 * Resets the rate limit counter for a specific key upon successful action (e.g., valid login).
 */
export function resetRateLimit(key: string): void {
  delete rateLimitStore[key];
}
