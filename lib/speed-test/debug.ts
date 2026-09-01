/**
 * Development-only engine tracing. Production UI never reads these logs.
 */
export function createTestSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function isSpeedTestDebugEnabled(): boolean {
  return process.env.NODE_ENV !== "production"
}

export function logSpeedTestSession(
  sessionId: string,
  event: string,
  details?: Record<string, unknown>
) {
  if (!isSpeedTestDebugEnabled()) {
    return
  }
  if (details && Object.keys(details).length > 0) {
    console.info(`[session ${sessionId}] ${event}`, details)
    return
  }
  console.info(`[session ${sessionId}] ${event}`)
}

export function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const extra =
      "phase" in error || "failureReason" in error
        ? {
            phase:
              "phase" in error ? String((error as { phase: unknown }).phase) : undefined,
            failureReason:
              "failureReason" in error
                ? String((error as { failureReason: unknown }).failureReason)
                : undefined,
          }
        : {}
    return {
      name: error.name,
      message: error.message,
      cause:
        error.cause instanceof Error
          ? { name: error.cause.name, message: error.cause.message }
          : error.cause ?? undefined,
      ...extra,
    }
  }
  return { name: typeof error, message: String(error) }
}
