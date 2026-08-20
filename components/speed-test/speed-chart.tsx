import { percentile } from "@/lib/speed-test/format"

type SpeedChartProps = {
  values: number[]
  color: string
}

export function SpeedChart({ values, color }: SpeedChartProps) {
  const width = 322
  const height = 88
  const points = values.filter((value) => Number.isFinite(value) && value >= 0)
  if (points.length < 2) {
    return <div className="h-[88px] w-full" />
  }

  const max = Math.max(...points, 1)
  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width
    const y = height - (value / max) * (height - 18) - 14
    return { x, y }
  })
  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`
  const p90 = percentile(points, 0.9)
  const p90Index = points.findIndex((value) => value >= p90)
  const marker = coords[Math.max(p90Index, 0)]

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[88px] w-full"
        aria-hidden="true"
      >
        <path d={area} fill={color} opacity="0.16" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" />
        {marker ? (
          <line
            x1={marker.x}
            x2={marker.x}
            y1="0"
            y2={height - 12}
            stroke={color}
            strokeOpacity="0.45"
            strokeDasharray="3 3"
          />
        ) : null}
      </svg>
      {marker ? (
        <span
          className="pointer-events-none absolute top-0 text-[10px] text-muted-foreground"
          style={{ left: `min(${(marker.x / width) * 100}%, 72%)` }}
        >
          90th percentile
        </span>
      ) : null}
    </div>
  )
}
