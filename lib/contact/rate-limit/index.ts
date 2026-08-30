import { createMemoryRateLimitStore } from "@/lib/contact/rate-limit/memory"
import type { RateLimitStore } from "@/lib/contact/rate-limit/types"

export type { RateLimitResult, RateLimitStore } from "@/lib/contact/rate-limit/types"

const globalForRateLimit = globalThis as typeof globalThis & {
  __speedstarContactRateLimit?: RateLimitStore
}

export const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
} as const

/** 5 submissions per key per 15 minutes (IP and email are checked separately). */
export function getContactRateLimitStore(): RateLimitStore {
  if (!globalForRateLimit.__speedstarContactRateLimit) {
    globalForRateLimit.__speedstarContactRateLimit = createMemoryRateLimitStore({
      limit: CONTACT_RATE_LIMIT.limit,
      windowMs: CONTACT_RATE_LIMIT.windowMs,
    })
  }

  return globalForRateLimit.__speedstarContactRateLimit
}
