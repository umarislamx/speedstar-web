import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react"

import { MeasurementPlot } from "@/components/speed-test/measurement-plot"
import { SpeedChart } from "@/components/speed-test/speed-chart"
import { Button } from "@/components/ui/button"
import { formatMbps, formatMs, formatPercent } from "@/lib/speed-test/format"
import { qualityRatingLabel } from "@/lib/speed-test/quality"
import type {
  Measurement,
  QualityRating,
  SpeedTestResult,
} from "@/lib/speed-test/types"
import { cn } from "@/lib/utils"

type ResultsStateProps = {
  result: SpeedTestResult
  downloadHistory: number[]
  uploadHistory: number[]
  onRetest: () => void
}

export function ResultsState({
  result,
  downloadHistory,
  uploadHistory,
  onRetest,
}: ResultsStateProps) {
  return (
    <section className="mx-auto flex w-full max-w-[764px] flex-1 flex-col gap-8 px-4 py-8 pb-16">
      <div className="flex items-center justify-center gap-2">
        <span className="size-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Speed test results</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ResultSpeedCard
          label="Download"
          color="#22c55e"
          mbps={result.download}
          history={downloadHistory}
        />
        <ResultSpeedCard
          label="Upload"
          color="#f97316"
          mbps={result.upload}
          history={uploadHistory}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
        <RangeMetric
          label="Latency"
          value={formatMs(result.latency)}
          unit="ms"
          down={formatMs(result.latencyDown, 0)}
          up={formatMs(result.latencyUp, 0)}
        />
        <RangeMetric
          label="Jitter"
          value={formatMs(result.jitter)}
          unit="ms"
          down={formatMs(result.jitterDown, 0)}
          up={formatMs(result.jitterUp, 0)}
        />
        <div>
          <p className="text-xs text-muted-foreground">Packet Loss</p>
          <p className="text-2xl font-semibold">
            {formatPercent(result.loss)}{" "}
            <span className="text-sm text-muted-foreground">%</span>
          </p>
        </div>
        <Button type="button" size="cta" onClick={onRetest}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retest
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium">Network quality score</h2>
          <QualityRow label="Video Streaming" rating={result.quality.videoStreaming} />
          <QualityRow label="Online Gaming" rating={result.quality.onlineGaming} />
          <QualityRow label="Video Chatting" rating={result.quality.videoChatting} />
        </div>
        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-4 text-sm font-medium">Network details</h2>
          <DetailRow label="Connected via" value={result.network.connectedVia} />
          <DetailRow label="Server location" value={result.network.serverLocation} />
          <DetailRow label="Your network" value={result.network.yourNetwork} />
          <DetailRow label="Service provider" value={result.network.serviceProvider} />
          <DetailRow label="Your IP address" value={result.network.ipAddress} />
        </div>
      </div>

      {result.packetLoss ? (
        <div className="rounded-xl border border-border p-6">
          <h2 className="mb-3 text-sm font-medium">Packet loss measurements</h2>
          <p className="mb-2 text-sm text-muted-foreground">{result.packetLoss.label}</p>
          <div className="flex h-3 overflow-hidden rounded-full">
            <div
              className="bg-[#22c55e]"
              style={{ width: `${result.packetLoss.receivedPercent}%` }}
            />
            <div
              className="bg-destructive"
              style={{ width: `${result.packetLoss.lostPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Received: {result.packetLoss.receivedPercent}% Lost:{" "}
            {result.packetLoss.lostPercent}%
          </p>
        </div>
      ) : null}

      <MeasurementGroup
        title="Latency measurements"
        color="#22c55e"
        items={result.latencyMeasurements}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <MeasurementGroup
          title="Download measurements"
          color="#22c55e"
          items={result.downloadMeasurements}
        />
        <MeasurementGroup
          title="Upload measurements"
          color="#f97316"
          items={result.uploadMeasurements}
        />
      </div>
    </section>
  )
}

function ResultSpeedCard({
  label,
  color,
  mbps,
  history,
}: {
  label: string
  color: string
  mbps: number
  history: number[]
}) {
  return (
    <div className="rounded-xl border border-border p-6">
      <p className="text-sm font-medium" style={{ color }}>
        {label}
      </p>
      <p className="text-[2rem] font-semibold">
        {formatMbps(mbps)}{" "}
        <span className="text-base font-medium text-muted-foreground">Mbps</span>
      </p>
      <SpeedChart values={history} color={color} />
    </div>
  )
}

function RangeMetric({
  label,
  value,
  unit,
  down,
  up,
}: {
  label: string
  value: string
  unit: string
  down: string
  up: string
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">
        {value}{" "}
        <span className="text-sm text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-0.5 text-[#22c55e]">
          <ArrowDown className="size-3" aria-hidden="true" />
          {down} ms
        </span>
        <span className="inline-flex items-center gap-0.5 text-[#f97316]">
          <ArrowUp className="size-3" aria-hidden="true" />
          {up} ms
        </span>
      </p>
    </div>
  )
}

function QualityRow({
  label,
  rating,
}: {
  label: string
  rating: QualityRating
}) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium",
          rating === "good" && "text-[#22c55e]",
          rating === "medium" && "text-[#f59e0b]",
          rating === "bad" && "text-destructive"
        )}
      >
        {qualityRatingLabel(rating)}
      </span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right break-words">{value}</span>
    </div>
  )
}

function MeasurementGroup({
  title,
  color,
  items,
}: {
  title: string
  color: string
  items: Measurement[]
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <MeasurementPlot key={item.label} item={item} color={color} />
        ))}
      </div>
    </div>
  )
}
