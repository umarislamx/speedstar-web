export const TESTING_PHASES = [
  "idle",
  "connecting",
  "finding_server",
  "ping",
  "preparing_download",
  "download",
  "preparing_upload",
  "upload",
  "saving",
  "finished",
] as const

export type TestingPhase = (typeof TESTING_PHASES)[number]

export const SPEED_TEST_VISUAL_PHASES = [
  "idle",
  "testing_download",
  "testing_upload",
  "completed",
] as const

export type SpeedTestVisualPhase = (typeof SPEED_TEST_VISUAL_PHASES)[number]

export type QualityRating = "good" | "medium" | "bad"

export type NetworkQuality = {
  videoStreaming: QualityRating
  onlineGaming: QualityRating
  videoChatting: QualityRating
}

export type NetworkDetails = {
  connectedVia: string
  serverLocation: string
  yourNetwork: string
  serviceProvider: string
  ipAddress: string
}

export type Measurement = {
  label: string
  unit: string
  axisMax: number
  axisLabels: string[]
  min: number
  q1: number
  median: number
  q3: number
  max: number
  samples: number[]
}

export type PacketLossStat = {
  label: string
  receivedPercent: number
  lostPercent: number
}

export type ThroughputSample = {
  mbps: number
  activeElapsedMs: number
}

export type LatencyResult = {
  samplesMs: number[]
  medianMs: number
  minMs: number
  jitterMs: number
  failedProbePercent: number
  probeAttempts: number
  probeSuccesses: number
}

export type ThroughputResult = {
  scoredMbps: number
  samples: ThroughputSample[]
  totalBytesConfirmed: number
  activeDurationMs: number
  streamsUsed: number
  loadedLatencyMs: number[]
  bytesAtGrace: number
}

export type ClientMeta = {
  ip: string
  isp: string
  org: string
  asn: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
}

export type ServerEndpoint = {
  id: string
  displayName: string
  providerId: string
  downloadUrl: string
  uploadUrl: string
  pingUrl: string
  latitude: number | null
  longitude: number | null
  regionTag: string
}

export type SpeedTestResult = {
  download: number
  upload: number
  ping: number
  jitter: number
  loss: number | null
  isp: string
  server: string
  city: string
  ip: string
  latency: number
  latencyDown: number
  latencyUp: number
  jitterDown: number
  jitterUp: number
  measuredAt: string
  quality: NetworkQuality
  network: NetworkDetails
  latencyMeasurements: Measurement[]
  packetLoss: PacketLossStat | null
  downloadMeasurements: Measurement[]
  uploadMeasurements: Measurement[]
  clientLat: number | null
  clientLon: number | null
  serverLat: number | null
  serverLon: number | null
  probeAttempts: number
  probeSuccesses: number
}

export type SpeedTestState = {
  phase: TestingPhase
  error: string | null
  result: SpeedTestResult | null
  liveDownloadMbps: number
  liveUploadMbps: number
  pingMs: number | null
  jitterMs: number | null
  packetLossPercent: number | null
  isPaused: boolean
  pausedByConnectivity: boolean
  downloadHistory: number[]
  uploadHistory: number[]
  serverLabel: string
  ispLabel: string
  runStartedAt: number | null
}

export const NETWORK_UNKNOWN = "Unknown"

export const EMPTY_NETWORK_QUALITY: NetworkQuality = {
  videoStreaming: "medium",
  onlineGaming: "medium",
  videoChatting: "medium",
}

export const EMPTY_NETWORK_DETAILS: NetworkDetails = {
  connectedVia: NETWORK_UNKNOWN,
  serverLocation: NETWORK_UNKNOWN,
  yourNetwork: NETWORK_UNKNOWN,
  serviceProvider: NETWORK_UNKNOWN,
  ipAddress: NETWORK_UNKNOWN,
}

export const EMPTY_CLIENT_META: ClientMeta = {
  ip: "",
  isp: "",
  org: "",
  asn: "",
  city: "",
  country: "",
  latitude: null,
  longitude: null,
}

export const INITIAL_SPEED_TEST_STATE: SpeedTestState = {
  phase: "idle",
  error: null,
  result: null,
  liveDownloadMbps: 0,
  liveUploadMbps: 0,
  pingMs: null,
  jitterMs: null,
  packetLossPercent: null,
  isPaused: false,
  pausedByConnectivity: false,
  downloadHistory: [],
  uploadHistory: [],
  serverLabel: "",
  ispLabel: "",
  runStartedAt: null,
}
