"use client"

import { useEffect, useState } from "react"

import { ErrorState } from "@/components/speed-test/error-state"
import { MeasuringState } from "@/components/speed-test/measuring-state"
import { ReadyState } from "@/components/speed-test/ready-state"
import { ResultsState } from "@/components/speed-test/results-state"
import { TestProgressBar } from "@/components/speed-test/progress-bar"
import { useSpeedTest } from "@/hooks/use-speed-test"
import { elapsedTestProgress } from "@/lib/speed-test/format"
import { isRunningPhase } from "@/lib/speed-test/phase"

export function SpeedTestExperience() {
  const speedTest = useSpeedTest()
  const [progress, setProgress] = useState(0)
  const running = isRunningPhase(speedTest.phase)

  useEffect(() => {
    if (speedTest.phase === "idle" || speedTest.error) {
      setProgress(0)
      return
    }
    if (speedTest.phase === "finished") {
      setProgress(100)
      return
    }

    function tick() {
      if (speedTest.isPaused) {
        return
      }
      setProgress(
        elapsedTestProgress(speedTest.runStartedAt, speedTest.phase)
      )
    }

    tick()
    const timer = window.setInterval(tick, 200)
    return () => window.clearInterval(timer)
  }, [
    speedTest.error,
    speedTest.isPaused,
    speedTest.phase,
    speedTest.runStartedAt,
  ])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TestProgressBar value={progress} visible={running} />
      {speedTest.error ? (
        <ErrorState error={speedTest.error} onRetry={speedTest.retest} />
      ) : speedTest.phase === "idle" ? (
        <ReadyState onStart={speedTest.startTest} />
      ) : speedTest.phase === "finished" && speedTest.result ? (
        <ResultsState
          result={speedTest.result}
          downloadHistory={speedTest.downloadHistory}
          uploadHistory={speedTest.uploadHistory}
          onRetest={speedTest.retest}
        />
      ) : (
        <MeasuringState
          state={speedTest}
          onPause={speedTest.togglePause}
          onRetest={speedTest.retest}
        />
      )}
    </div>
  )
}
