import { ArrowDown, ArrowUp, Pause, Play, RefreshCw } from "lucide-react"

import { SpeedChart } from "@/components/speed-test/speed-chart"
import { Button } from "@/components/ui/button"
import { formatMbps, formatMs, formatPercent } from "@/lib/speed-test/format"
import { testingStatusLabel } from "@/lib/speed-test/phase"
import type { SpeedTestState } from "@/lib/speed-test/types"

type MeasuringStateProps = {
  state: SpeedTestState
  onPause: () => void
  onRetest: () => void
}

export function MeasuringState({
  state,
  onPause,
  onRetest,
}: MeasuringStateProps) {
  const status = testingStatusLabel(state.phase, state.isPaused)
  const caption = [state.serverLabel, state.ispLabel]
    .filter((value) => value && value !== "Detecting..." && value !== "Connecting...")
    .join(" · ")

  return (
    <section className="mx-auto flex w-full max-w-[390px] flex-1 flex-col items-stretch px-4 py-6 sm:max-w-[420px]">
      <div className="flex flex-col items-center justify-center gap-1 py-4">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {status}
          </p>
        </div>
        {caption ? (
          <p className="text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </div>

      <SpeedMetric
        label="Download"
        color="#22c55e"
        icon="down"
        value={state.liveDownloadMbps}
        history={state.downloadHistory}
      />
      <SpeedMetric
        label="Upload"
        color="#f97316"
        icon="up"
        value={state.liveUploadMbps}
        history={state.uploadHistory}
      />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Latency" value={formatMs(state.pingMs)} unit="ms" />
        <Metric label="Jitter" value={formatMs(state.jitterMs)} unit="ms" />
        <Metric
          label="Packet Loss"
          value={formatPercent(state.packetLossPercent)}
          unit="%"
        />
      </div>

      <div className="mt-6 flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="cta"
          className="flex-1"
          onClick={onPause}
        >
          {state.isPaused ? (
            <Play className="size-4" aria-hidden="true" />
          ) : (
            <Pause className="size-4" aria-hidden="true" />
          )}
          {state.isPaused ? "Resume" : "Pause"}
        </Button>
        <Button type="button" size="cta" className="flex-1" onClick={onRetest}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Retest
        </Button>
      </div>
    </section>
  )
}

function SpeedMetric({
  label,
  color,
  icon,
  value,
  history,
}: {
  label: string
  color: string
  icon: "down" | "up"
  value: number
  history: number[]
}) {
  return (
    <div className="py-3">
      <p className="flex items-center gap-1 text-sm font-medium" style={{ color }}>
        {label}
        {icon === "down" ? (
          <ArrowDown className="size-3.5" aria-hidden="true" />
        ) : (
          <ArrowUp className="size-3.5" aria-hidden="true" />
        )}
      </p>
      <p className="text-[2rem] font-semibold leading-10 tracking-tight">
        {formatMbps(value)}{" "}
        <span className="text-base font-medium text-muted-foreground">Mbps</span>
      </p>
      <SpeedChart values={history} color={color} />
    </div>
  )
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">
        {value}{" "}
        <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  )
}
