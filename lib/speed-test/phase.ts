import type {
  SpeedTestVisualPhase,
  TestingPhase,
} from "@/lib/speed-test/types"

/**
 * Port of Android `TestingPhase.toSpeedTestPhase`.
 */
export function toVisualPhase(phase: TestingPhase): SpeedTestVisualPhase {
  if (phase === "preparing_download" || phase === "download") {
    return "testing_download"
  }
  if (phase === "preparing_upload" || phase === "upload") {
    return "testing_upload"
  }
  if (phase === "saving" || phase === "finished") {
    return "completed"
  }
  return "idle"
}

/**
 * Port of Android `TestingStatus` labels.
 */
export function testingStatusLabel(
  phase: TestingPhase,
  isPaused = false
): string {
  if (isPaused) {
    return "Paused"
  }

  switch (phase) {
    case "connecting":
      return "Connecting..."
    case "finding_server":
      return "Selecting Server..."
    case "ping":
      return "Measuring Latency..."
    case "preparing_download":
      return "Preparing Download..."
    case "download":
      return "Measuring download speed…"
    case "preparing_upload":
      return "Preparing Upload..."
    case "upload":
      return "Measuring upload speed…"
    case "saving":
      return "Saving results..."
    default:
      return "Preparing..."
  }
}

export function isRunningPhase(phase: TestingPhase): boolean {
  return phase !== "idle" && phase !== "finished"
}
