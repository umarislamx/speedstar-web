import { delay, nowMs } from "@/lib/speed-test/async"

/** Shared pause accounting for active-duration measurements. */
export class PauseGate {
  paused = false
  private pauseStartMs = 0
  private pausedAccumMs = 0

  reset() {
    this.paused = false
    this.pauseStartMs = 0
    this.pausedAccumMs = 0
  }

  pause() {
    if (!this.paused) {
      this.paused = true
      this.pauseStartMs = nowMs()
    }
  }

  resume() {
    if (this.paused) {
      this.paused = false
      this.pausedAccumMs += nowMs() - this.pauseStartMs
    }
  }

  activeMs(startMs: number): number {
    const currentPause = this.paused ? nowMs() - this.pauseStartMs : 0
    return nowMs() - startMs - this.pausedAccumMs - currentPause
  }

  async awaitIfPaused(signal?: AbortSignal): Promise<boolean> {
    if (!this.paused) {
      return false
    }
    while (this.paused) {
      if (signal?.aborted) {
        throw signal.reason ?? new DOMException("Aborted", "AbortError")
      }
      await delay(60, signal)
    }
    return true
  }
}
