/**
 * Simple in-memory rate limiter for API routes.
 * For production, use Redis or a dedicated rate-limit service.
 */

const windowMs = 60 * 1000; // 1 minute
const maxRequests = 30;

const store = new Map<string, { count: number; resetAt: number }>();

function getKey(req: { headers?: { "x-forwarded-for"?: string; "x-real-ip"?: string } }): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : null;
  return ip ?? req.headers?.["x-real-ip"] ?? "anonymous";
}

export function checkRateLimit(req: unknown): { ok: boolean; remaining: number } {
  const key = getKey(req as { headers?: Record<string, string> });
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: maxRequests - 1 };
  }

  if (now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count += 1;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { ok: entry.count <= maxRequests, remaining };
}
