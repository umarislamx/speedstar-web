import { jitter, median } from "@/lib/speed-test/latency"
import { latencyMeasurements } from "@/lib/speed-test/measurements"
import { deriveQuality } from "@/lib/speed-test/quality"
import {
  EMPTY_NETWORK_DETAILS,
  NETWORK_UNKNOWN,
  type ClientMeta,
  type LatencyResult,
  type Measurement,
  type NetworkDetails,
  type PacketLossStat,
  type ServerEndpoint,
  type SpeedTestResult,
  type ThroughputResult,
} from "@/lib/speed-test/types"
import { ipVersion } from "@/lib/speed-test/format"

export type OrchestratedResult = {
  meta: ClientMeta
  endpoint: ServerEndpoint
  colo: string
  latency: LatencyResult
  download: ThroughputResult
  upload: ThroughputResult
  downloadMeasurements: Measurement[]
  uploadMeasurements: Measurement[]
}

function buildNetworkDetails(
  meta: ClientMeta,
  endpoint: ServerEndpoint
): NetworkDetails {
  const base = meta.org || meta.isp
  const asnClean = String(meta.asn).replace(/^AS/i, "").trim()
  let yourNetwork = base || NETWORK_UNKNOWN
  if (asnClean && base) {
    yourNetwork = `${base} (AS${asnClean})`
  }

  return {
    connectedVia: ipVersion(meta.ip) ?? NETWORK_UNKNOWN,
    serverLocation: endpoint.displayName || meta.city || NETWORK_UNKNOWN,
    yourNetwork,
    serviceProvider: meta.isp || meta.org || NETWORK_UNKNOWN,
    ipAddress: meta.ip || NETWORK_UNKNOWN,
  }
}

function packetLossStat(latency: LatencyResult): PacketLossStat | null {
  const attempts = Math.max(latency.probeAttempts, latency.probeSuccesses)
  if (attempts <= 0) {
    return null
  }
  const successes = Math.min(Math.max(latency.probeSuccesses, 0), attempts)
  const lostRounded = Math.min(
    100,
    Math.max(0, Math.round(latency.failedProbePercent))
  )
  return {
    label: `Packet loss test (${successes}/${attempts})`,
    receivedPercent: Math.min(100, Math.max(0, 100 - lostRounded)),
    lostPercent: lostRounded,
  }
}

export function buildSpeedTestResult(
  outcome: OrchestratedResult
): SpeedTestResult {
  const download = outcome.download.scoredMbps
  const upload = outcome.upload.scoredMbps
  const latency = outcome.latency.minMs
  const jitterMs = outcome.latency.jitterMs
  const ping = Math.round(latency)
  const latencyDown =
    outcome.download.loadedLatencyMs.length > 0
      ? median(outcome.download.loadedLatencyMs)
      : latency
  const latencyUp =
    outcome.upload.loadedLatencyMs.length > 0
      ? median(outcome.upload.loadedLatencyMs)
      : latency
  const jitterDown =
    outcome.download.loadedLatencyMs.length >= 2
      ? jitter(outcome.download.loadedLatencyMs)
      : jitterMs
  const jitterUp =
    outcome.upload.loadedLatencyMs.length >= 2
      ? jitter(outcome.upload.loadedLatencyMs)
      : jitterMs
  const network = outcome.meta.ip
    ? buildNetworkDetails(outcome.meta, outcome.endpoint)
    : EMPTY_NETWORK_DETAILS
  const attempts = Math.max(
    outcome.latency.probeAttempts,
    outcome.latency.probeSuccesses
  )
  const successes = Math.min(
    Math.max(outcome.latency.probeSuccesses, 0),
    attempts
  )

  return {
    download,
    upload,
    ping,
    jitter: Math.round(jitterMs),
    loss: outcome.latency.failedProbePercent,
    isp: outcome.meta.isp,
    server: outcome.endpoint.displayName,
    city: outcome.meta.city,
    ip: outcome.meta.ip,
    latency,
    latencyDown,
    latencyUp,
    jitterDown,
    jitterUp,
    measuredAt: new Date().toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
    quality: deriveQuality(download, upload, ping),
    network: {
      ...network,
      serverLocation:
        outcome.endpoint.displayName || network.serverLocation,
    },
    latencyMeasurements: latencyMeasurements({
      unloaded: outcome.latency.samplesMs,
      duringDownload: outcome.download.loadedLatencyMs,
      duringUpload: outcome.upload.loadedLatencyMs,
      unloadedSuccesses: successes,
      unloadedAttempts: attempts,
    }),
    packetLoss: packetLossStat(outcome.latency),
    downloadMeasurements: outcome.downloadMeasurements,
    uploadMeasurements: outcome.uploadMeasurements,
    clientLat: outcome.meta.latitude,
    clientLon: outcome.meta.longitude,
    serverLat: outcome.endpoint.latitude,
    serverLon: outcome.endpoint.longitude,
    probeAttempts: attempts,
    probeSuccesses: successes,
  }
}

export function isValidOutcome(outcome: OrchestratedResult): boolean {
  return (
    outcome.download.scoredMbps > 0 &&
    outcome.upload.scoredMbps > 0 &&
    outcome.latency.minMs > 0 &&
    outcome.download.samples.some((sample) => sample.mbps > 0) &&
    outcome.upload.samples.some((sample) => sample.mbps > 0)
  )
}
