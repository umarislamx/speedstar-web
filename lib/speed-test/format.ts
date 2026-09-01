export function smoothLiveMbps(ema: number, speed: number): number {
  if (ema === 0) {
    return speed
  }
  if (speed > ema * 3 && ema > 1) {
    return ema + 0.15 * (speed - ema)
  }
  return ema + 0.4 * (speed - ema)
}

export function formatMbps(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return "—"
  }
  return value.toFixed(1)
}

export function formatMs(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value) || value < 0) {
    return "—"
  }
  return value.toFixed(digits)
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return "—"
  }
  return value.toFixed(2)
}

export function ipVersion(ip: string): "IPv4" | "IPv6" | null {
  if (!ip) {
    return null
  }
  return ip.includes(":") ? "IPv6" : "IPv4"
}

export function percentile(values: number[], p: number): number {
  const points = values.filter((value) => Number.isFinite(value))
  if (points.length === 0) {
    return 0
  }
  const sorted = [...points].sort((left, right) => left - right)
  const index = (sorted.length - 1) * p
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) {
    return sorted[lower] ?? 0
  }
  const weight = index - lower
  return (sorted[lower] ?? 0) * (1 - weight) + (sorted[upper] ?? 0) * weight
}

export function elapsedTestProgress(
  startedAt: number | null,
  phase: string
): number {
  if (!startedAt || phase === "idle") {
    return 0
  }
  if (phase === "finished") {
    return 100
  }
  const elapsed = Date.now() - startedAt
  const totalMs = 2_000 + 7_000 + 5_500 + 400
  const raw = (elapsed / totalMs) * 100
  if (phase === "saving") {
    return Math.min(99, Math.max(92, raw))
  }
  return Math.min(98, Math.max(2, raw))
}
