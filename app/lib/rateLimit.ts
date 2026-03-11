type RateKey = string;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<RateKey, Bucket>();

interface RateLimitOptions {
  key: string;
  limit?: number;
  windowMs?: number;
}

export function rateLimit({ key, limit = 30, windowMs = 60_000 }: RateLimitOptions) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count };
}

