import type { Measurement } from "@/lib/speed-test/types"

type MeasurementPlotProps = {
  item: Measurement
  color: string
}

export function MeasurementPlot({ item, color }: MeasurementPlotProps) {
  const max = Math.max(item.axisMax, item.max, 1)
  const left = (value: number) => `${Math.min(100, Math.max(0, (value / max) * 100))}%`
  const boxLeft = (item.q1 / max) * 100
  const boxWidth = Math.max(((item.q3 - item.q1) / max) * 100, 1)

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium" style={{ color }}>
        {item.label}
      </p>
      <div className="relative mt-4 h-6">
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-border" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2"
          style={{
            left: left(item.min),
            width: `${Math.max(((item.max - item.min) / max) * 100, 1)}%`,
            backgroundColor: color,
            opacity: 0.45,
          }}
        />
        <div
          className="absolute top-1 h-4 rounded-sm"
          style={{
            left: `${boxLeft}%`,
            width: `${boxWidth}%`,
            backgroundColor: color,
            opacity: 0.35,
          }}
        />
        <div
          className="absolute top-0.5 h-5 w-0.5 rounded-full"
          style={{ left: left(item.median), backgroundColor: color }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {item.axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
