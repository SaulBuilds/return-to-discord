const rateLimitMap = new Map<
  string,
  { count: number; lastReset: number }
>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil(
      (record.lastReset + windowMs - now) / 1000
    );
    return { success: false, remaining: 0, retryAfter };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}

// Cleanup stale entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap) {
      if (now - record.lastReset > 300_000) {
        rateLimitMap.delete(key);
      }
    }
  }, 60_000);
}
