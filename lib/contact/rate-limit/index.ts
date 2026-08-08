import { createMemoryRateLimitStore } from "@/lib/contact/rate-limit/memory"
import type { RateLimitStore } from "@/lib/contact/rate-limit/types"

export type { RateLimitResult, RateLimitStore } from "@/lib/contact/rate-limit/types"

const globalForRateLimit = globalThis as typeof globalThis & {
  __speedstarContactRateLimit?: RateLimitStore
}

/** 5 submissions per IP per 15 minutes. */
export function getContactRateLimitStore(): RateLimitStore {
  if (!globalForRateLimit.__speedstarContactRateLimit) {
    globalForRateLimit.__speedstarContactRateLimit = createMemoryRateLimitStore({
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
  }

  return globalForRateLimit.__speedstarContactRateLimit
}
