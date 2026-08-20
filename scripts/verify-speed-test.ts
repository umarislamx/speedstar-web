import { fromMbpsSamples } from "../lib/speed-test/measurements"
import { jitter, summarizeUnloadedLatency } from "../lib/speed-test/latency"
import { SpeedTestOrchestrator } from "../lib/speed-test/orchestrator"
import { deriveQuality } from "../lib/speed-test/quality"
import {
  cumulativeMbps,
  instantaneousMbps,
  scoreThroughput,
  trimmedMean,
} from "../lib/speed-test/scoring"

function assertEqual(actual: number, expected: number, epsilon: number, label: string) {
  if (Math.abs(actual - expected) > epsilon) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`)
  }
  console.log(`ok  ${label} = ${actual}`)
}

function assertTrue(value: boolean, label: string) {
  if (!value) {
    throw new Error(`${label}: expected true`)
  }
  console.log(`ok  ${label}`)
}

async function runAlgorithmChecks() {
  console.log("\n== Android ThroughputScorer checks ==")
  assertEqual(instantaneousMbps(1_250_000, 1_000), 10, 0.001, "instantaneousMbps decimal megabits")

  const graceScore = scoreThroughput({
    samples: [
      { mbps: 8, activeElapsedMs: 4_000 },
      { mbps: 8, activeElapsedMs: 5_000 },
    ],
    totalBytesConfirmed: 13_000_000,
    bytesAtGrace: 3_000_000,
    activeDurationMs: 13_000,
    graceMs: 3_000,
  })
  assertEqual(graceScore, 8, 0.5, "score excludes grace bytes")

  const postGrace = scoreThroughput({
    samples: [
      { mbps: 8, activeElapsedMs: 4_000 },
      { mbps: 8, activeElapsedMs: 5_000 },
    ],
    totalBytesConfirmed: 10_000_000,
    bytesAtGrace: 0,
    activeDurationMs: 13_000,
    graceMs: 3_000,
  })
  assertEqual(postGrace, 8, 0.5, "score post-grace only")

  assertEqual(cumulativeMbps(5_000_000, 50, 750), 0, 0.001, "cumulative suppresses until settle")
  assertEqual(cumulativeMbps(5_000_000, 5_000, 750), 8, 0.5, "cumulative stable window")
  assertEqual(cumulativeMbps(625_000, 1_000, 750), 5, 0.1, "cumulative does not use grace bytes")
  assertTrue(cumulativeMbps(625_000, 1_000, 750) < 50, "cumulative not inflated")

  assertEqual(
    trimmedMean([1, 10, 10, 10, 10, 10, 10, 10, 10, 100], 0.1),
    10,
    0.001,
    "trimmedMean 10%"
  )

  console.log("\n== Latency / quality / measurement labels ==")
  const latency = summarizeUnloadedLatency({
    samplesMs: [20, 22, 21, 23, 19, 24],
    failures: 0,
    attempts: 6,
  })
  assertEqual(latency.minMs, 19, 0.001, "headline ping is min RTT")
  assertTrue(jitter([20, 22, 21]) > 0, "jitter from consecutive deltas")

  const quality = deriveQuality(30, 6, 20)
  assertTrue(quality.videoStreaming === "good", "streaming good >= 25")
  assertTrue(quality.onlineGaming === "good", "gaming good ping 1-49")
  assertTrue(quality.videoChatting === "good", "chatting good upload>=5 ping<80")

  const cards = fromMbpsSamples([10, 12, 11, 13, 14, 15, 16, 12, 11], "download")
  assertTrue(cards.some((card) => card.label.startsWith("Start download test")), "Start label")
  assertTrue(cards.every((card) => !/100kB|1MB|10MB/.test(card.label)), "no Cloudflare file-size labels")
}

async function runCloudflareCheck() {
  console.log("\n== Live Cloudflare orchestrator ==")
  const orchestrator = new SpeedTestOrchestrator()
  const started = Date.now()
  const outcome = await orchestrator.run({
    onPhase: (phase, isp, server) => {
      console.log(`phase ${phase}  isp=${isp}  server=${server}`)
    },
    onPing: (ping) => {
      console.log(`ping sample ${ping} ms`)
    },
    onLatencyStats: (ping, jitterMs, loss) => {
      console.log(`latency stats ping=${ping} jitter=${jitterMs} loss=${loss.toFixed(2)}%`)
    },
    onDownload: (mbps) => {
      console.log(`download live ${mbps.toFixed(1)} Mbps`)
    },
    onUpload: (mbps) => {
      console.log(`upload live ${mbps.toFixed(1)} Mbps`)
    },
  })
  orchestrator.close()

  console.log(`\ncompleted in ${((Date.now() - started) / 1000).toFixed(1)}s`)
  console.log(`server     ${outcome.endpoint.displayName}`)
  console.log(`ping min   ${outcome.latency.minMs.toFixed(2)} ms`)
  console.log(`jitter     ${outcome.latency.jitterMs.toFixed(2)} ms`)
  console.log(`loss       ${outcome.latency.failedProbePercent.toFixed(2)}% (${outcome.latency.probeSuccesses}/${outcome.latency.probeAttempts})`)
  console.log(`download   ${outcome.download.scoredMbps.toFixed(2)} Mbps  bytes=${outcome.download.totalBytesConfirmed}  samples=${outcome.download.samples.length}`)
  console.log(`upload     ${outcome.upload.scoredMbps.toFixed(2)} Mbps  bytes=${outcome.upload.totalBytesConfirmed}  samples=${outcome.upload.samples.length}`)
  console.log(`cards      dl=${outcome.downloadMeasurements.map((item) => item.label).join(" | ")}`)
  console.log(`cards      ul=${outcome.uploadMeasurements.map((item) => item.label).join(" | ")}`)

  if (outcome.latency.minMs <= 0) {
    throw new Error("Cloudflare ping was 0")
  }
  if (outcome.download.scoredMbps <= 0 || outcome.download.totalBytesConfirmed < 500_000) {
    throw new Error("Cloudflare download did not meet Android validation gates")
  }
  if (outcome.upload.scoredMbps <= 0 || outcome.upload.totalBytesConfirmed < 500_000) {
    throw new Error("Cloudflare upload did not meet Android validation gates")
  }
}

async function main() {
  await runAlgorithmChecks()
  await runCloudflareCheck()
  console.log("\nAll measurement checks passed.")
}

main().catch((error) => {
  console.error("\nVERIFY FAILED")
  console.error(error)
  process.exitCode = 1
})
