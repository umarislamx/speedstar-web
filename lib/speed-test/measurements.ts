import type { Measurement } from "@/lib/speed-test/types"

function niceStep(rough: number): number {
  const value = Math.max(rough, 1_000_000)
  const candidates = [
    1e6, 2e6, 5e6, 10e6, 15e6, 20e6, 25e6, 30e6, 50e6, 75e6, 100e6, 150e6,
    200e6, 500e6,
  ]
  return candidates.find((candidate) => candidate >= value) ?? value * 1.2
}

function formatStep(bps: number): string {
  const mbps = bps / 1_000_000
  return mbps >= 1 ? `${Math.trunc(mbps)}M` : `${Math.trunc(bps / 1000)}K`
}

function splitWindows(samples: number[]): number[][] {
  if (samples.length < 6) {
    return [samples]
  }
  const size = samples.length
  const a = Math.trunc(size / 3)
  const b = Math.trunc((size * 2) / 3)
  return [samples.slice(0, a), samples.slice(a, b), samples.slice(b)].filter(
    (window) => window.length >= 2
  )
}

function toMeasurement(samplesMbps: number[], label: string): Measurement | null {
  if (samplesMbps.length < 2) {
    return null
  }
  const samplesBps = [...samplesMbps.map((mbps) => mbps * 1_000_000)].sort(
    (left, right) => left - right
  )
  const peak = samplesBps[samplesBps.length - 1] ?? 0
  const step = niceStep(peak / 3)
  return {
    label,
    unit: "bps",
    axisMax: step * 3,
    axisLabels: ["0", formatStep(step), formatStep(step * 2), formatStep(step * 3)],
    min: samplesBps[0] ?? 0,
    q1: samplesBps[Math.trunc(samplesBps.length / 4)] ?? 0,
    median: samplesBps[Math.trunc(samplesBps.length / 2)] ?? 0,
    q3: samplesBps[Math.trunc((samplesBps.length * 3) / 4)] ?? 0,
    max: peak,
    samples: samplesBps,
  }
}

/**
 * Port of Android `ThroughputMeasurementBuilder`.
 * Labels are Start / Mid / End — never 100kB / 1MB / 10MB.
 */
export function fromMbpsSamples(
  mbpsSamples: number[],
  direction: string
): Measurement[] {
  const positive = mbpsSamples.filter((value) => value > 0)
  if (positive.length < 2) {
    return []
  }

  const labels = [
    `Start ${direction} test`,
    `Mid ${direction} test`,
    `End ${direction} test`,
  ]

  return splitWindows(positive).flatMap((window, index) => {
    const measurement = toMeasurement(
      window,
      `${labels[index] ?? direction} (${window.length} samples)`
    )
    return measurement ? [measurement] : []
  })
}

export function latencyMeasurements(options: {
  unloaded: number[]
  duringDownload: number[]
  duringUpload: number[]
  unloadedSuccesses: number
  unloadedAttempts: number
}): Measurement[] {
  const axisLabels = ["0", "200", "400", "600"]

  function measurement(samples: number[], label: string): Measurement | null {
    if (samples.length < 2) {
      return null
    }
    const safe = [...samples].sort((left, right) => left - right)
    return {
      label,
      unit: "ms",
      axisMax: 600,
      axisLabels,
      min: safe[0] ?? 0,
      q1: safe[Math.trunc(safe.length / 4)] ?? 0,
      median: safe[Math.trunc(safe.length / 2)] ?? 0,
      q3: safe[Math.trunc((safe.length * 3) / 4)] ?? 0,
      max: safe[safe.length - 1] ?? 0,
      samples: safe,
    }
  }

  const attemptLabel = Math.max(
    options.unloadedAttempts,
    options.unloadedSuccesses,
    options.unloaded.length
  )
  const successLabel = Math.min(
    Math.max(options.unloadedSuccesses, options.unloaded.length),
    attemptLabel
  )

  return [
    measurement(
      options.unloaded,
      `Unloaded latency (${successLabel}/${attemptLabel})`
    ),
    measurement(
      options.duringDownload,
      `Latency during download (${options.duringDownload.length})`
    ),
    measurement(
      options.duringUpload,
      `Latency during upload (${options.duringUpload.length})`
    ),
  ].filter((item): item is Measurement => item != null)
}
