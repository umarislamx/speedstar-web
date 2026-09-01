export class SpeedTestRunException extends Error {
  readonly phase: string
  readonly failureReason: string

  constructor(
    phase: string,
    message: string,
    failureReason = message,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.name = "SpeedTestRunException"
    this.phase = phase
    this.failureReason = failureReason
  }
}

export function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true
  }
  return error instanceof Error && error.name === "AbortError"
}

export function combineSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener(
      "abort",
      () => {
        if (!controller.signal.aborted) {
          controller.abort(signal.reason)
        }
      },
      { once: true }
    )
  }

  return controller.signal
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"))
      return
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)

    function onAbort() {
      clearTimeout(timer)
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"))
    }

    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

export function nowMs(): number {
  return performance.now()
}
