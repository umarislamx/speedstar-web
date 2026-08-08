export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSeconds: number }

export type RateLimitStore = {
  consume: (key: string) => Promise<RateLimitResult> | RateLimitResult
}
