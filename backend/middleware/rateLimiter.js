/**
 * RateLimiter class for limiting request rates per user
 */
class RateLimiter {
  /**
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(maxRequests = 100, windowMs = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    // Map<userId, {count, resetTime}>
    this.requests = new Map();
  }

  /**
   * Check if user is within rate limit
   * @param {string} userId - User identifier (socket ID)
   * @returns {boolean} True if within limit, false if exceeded
   */
  checkLimit(userId) {
    const now = Date.now();
    const userLimit = this.requests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // New window - reset counter
      this.requests.set(userId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (userLimit.count >= this.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count
    userLimit.count++;
    return true;
  }

  /**
   * Reset rate limit for a user
   * @param {string} userId - User identifier
   */
  reset(userId) {
    this.requests.delete(userId);
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [userId, limit] of this.requests.entries()) {
      if (now > limit.resetTime) {
        this.requests.delete(userId);
      }
    }
  }
}

// Create rate limiter instances for different purposes
const positionRateLimiter = new RateLimiter(100, 1000); // 100 updates per second
const chatRateLimiter = new RateLimiter(10, 1000); // 10 messages per second

// Cleanup expired entries every 60 seconds
setInterval(() => {
  positionRateLimiter.cleanup();
  chatRateLimiter.cleanup();
}, 60000);

module.exports = {
  RateLimiter,
  positionRateLimiter,
  chatRateLimiter
};
