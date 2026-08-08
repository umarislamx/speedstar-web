import type { RateLimitResult, RateLimitStore } from "@/lib/contact/rate-limit/types"

type Bucket = {
  count: number
  resetAt: number
}

type MemoryRateLimitOptions = {
  /** Max requests per window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
}

/**
 * In-memory rate limiter suitable for single-instance deployments.
 * Swap this store for Redis/Upstash later via the RateLimitStore interface.
 */
export function createMemoryRateLimitStore(
  options: MemoryRateLimitOptions
): RateLimitStore {
  const buckets = new Map<string, Bucket>()

  return {
    consume(key: string): RateLimitResult {
      const now = Date.now()
      const existing = buckets.get(key)

      if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs })
        return { allowed: true, remaining: options.limit - 1 }
      }

      if (existing.count >= options.limit) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((existing.resetAt - now) / 1000)
        )
        return { allowed: false, retryAfterSeconds }
      }

      existing.count += 1
      buckets.set(key, existing)
      return { allowed: true, remaining: options.limit - existing.count }
    },
  }
}
