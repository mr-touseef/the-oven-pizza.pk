/**
 * Minimal in-memory rate limiter. This is a best-effort defense against
 * rapid-fire form spam within a single serverless function instance — it is
 * NOT a substitute for a shared store (Redis/Upstash) under real load, since
 * each cold instance starts with an empty bucket. It still meaningfully
 * slows down naive bots and accidental double-submits.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return true;
  }
  return false;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
