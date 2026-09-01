type ProgressBarProps = {
  value: number
  visible: boolean
}

export function TestProgressBar({ value, visible }: ProgressBarProps) {
  if (!visible) {
    return null
  }

  return (
    <div className="h-1 w-full bg-muted" aria-hidden="true">
      <div
        className="h-full bg-[#22c55e] transition-[width] duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
