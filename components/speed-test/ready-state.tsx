"use client"

import { StartButton } from "@/components/speed-test/start-button"

type ReadyStateProps = {
  onStart: () => void
}

export function ReadyState({ onStart }: ReadyStateProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="flex size-[328px] items-center justify-center">
        <StartButton onStart={onStart} />
      </div>
      <p className="max-w-[239px] text-center text-base leading-6 text-muted-foreground">
        Tap to “Start” for speed test
      </p>
    </section>
  )
}
