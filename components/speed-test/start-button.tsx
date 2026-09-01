"use client"

import { cn } from "@/lib/utils"

type StartButtonProps = {
  onStart: () => void
}

export function StartButton({ onStart }: StartButtonProps) {
  return (
    <button
      type="button"
      onClick={onStart}
      className={cn(
        "flex size-[276px] shrink-0 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground",
        "text-[32px] font-semibold leading-12 tracking-tight",
        "transition-[transform,opacity] duration-150",
        "hover:opacity-90 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      )}
      aria-label="Start speed test"
    >
      Start
    </button>
  )
}
