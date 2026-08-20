"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  delay,
  isAbortError,
  SpeedTestRunException,
} from "@/lib/speed-test/async"
import { SPEED_TEST_CONFIG } from "@/lib/speed-test/config"
import {
  createTestSessionId,
  describeError,
  logSpeedTestSession,
} from "@/lib/speed-test/debug"
import { SPEED_TEST_ERROR } from "@/lib/speed-test/errors"
import { smoothLiveMbps } from "@/lib/speed-test/format"
import { SpeedTestOrchestrator } from "@/lib/speed-test/orchestrator"
import {
  buildSpeedTestResult,
  isValidOutcome,
} from "@/lib/speed-test/result-builder"
import {
  INITIAL_SPEED_TEST_STATE,
  type SpeedTestState,
  type TestingPhase,
} from "@/lib/speed-test/types"

const MEASURING_PHASES: TestingPhase[] = [
  "preparing_download",
  "download",
  "preparing_upload",
  "upload",
]

function mapError(error: unknown, online: boolean): string {
  if (!online) {
    return SPEED_TEST_ERROR.OFFLINE
  }
  if (error instanceof SpeedTestRunException) {
    if (error.failureReason.toLowerCase().includes("timeout")) {
      return SPEED_TEST_ERROR.TIMEOUT
    }
    return SPEED_TEST_ERROR.FAILED
  }
  if (error instanceof Error && /timeout/i.test(error.message)) {
    return SPEED_TEST_ERROR.TIMEOUT
  }
  return SPEED_TEST_ERROR.FAILED
}

export function useSpeedTest() {
  const [state, setState] = useState<SpeedTestState>(INITIAL_SPEED_TEST_STATE)
  const sessionIdRef = useRef(0)
  const testSessionIdRef = useRef("")
  const orchestratorRef = useRef<SpeedTestOrchestrator | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const downloadEmaRef = useRef(0)
  const uploadEmaRef = useRef(0)
  const hiddenPauseRef = useRef(false)
  const phaseRef = useRef<TestingPhase>("idle")

  const isCurrent = useCallback((session: number) => {
    return sessionIdRef.current === session
  }, [])

  const stopTest = useCallback(() => {
    sessionIdRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    orchestratorRef.current?.close()
    orchestratorRef.current = null
    downloadEmaRef.current = 0
    uploadEmaRef.current = 0
    hiddenPauseRef.current = false
    phaseRef.current = "idle"
    setState(INITIAL_SPEED_TEST_STATE)
  }, [])

  const failSession = useCallback((session: number, error: string) => {
    if (!isCurrent(session)) {
      return
    }
    logSpeedTestSession(testSessionIdRef.current, "failed", {
      phase: phaseRef.current,
      mappedError: error,
    })
    abortRef.current?.abort()
    abortRef.current = null
    orchestratorRef.current?.close()
    orchestratorRef.current = null
    phaseRef.current = "idle"
    setState({
      ...INITIAL_SPEED_TEST_STATE,
      error,
    })
  }, [isCurrent])

  const startTest = useCallback(() => {
    const session = sessionIdRef.current + 1
    sessionIdRef.current = session
    const testSessionId = createTestSessionId()
    testSessionIdRef.current = testSessionId
    abortRef.current?.abort()
    orchestratorRef.current?.close()
    downloadEmaRef.current = 0
    uploadEmaRef.current = 0
    hiddenPauseRef.current = false

    const abort = new AbortController()
    abortRef.current = abort
    const orchestrator = new SpeedTestOrchestrator(
      SPEED_TEST_CONFIG,
      abort.signal,
      testSessionId
    )
    orchestratorRef.current = orchestrator
    logSpeedTestSession(testSessionId, "started")

    setState({
      ...INITIAL_SPEED_TEST_STATE,
      phase: "connecting",
      runStartedAt: Date.now(),
    })
    phaseRef.current = "connecting"

    void (async () => {
      if (!navigator.onLine) {
        await delay(SPEED_TEST_CONFIG.offlineWaitMs, abort.signal).catch(() => undefined)
        if (!isCurrent(session)) {
          return
        }
        if (!navigator.onLine) {
          failSession(session, SPEED_TEST_ERROR.OFFLINE)
          return
        }
      }

      const watchdog = window.setTimeout(() => {
        if (!isCurrent(session)) {
          return
        }
        if (
          phaseRef.current === "connecting" ||
          phaseRef.current === "finding_server" ||
          phaseRef.current === "ping"
        ) {
          failSession(session, SPEED_TEST_ERROR.NO_CONNECTION)
        }
      }, SPEED_TEST_CONFIG.connectingWatchdogMs)

      const overall = window.setTimeout(() => {
        if (!isCurrent(session)) {
          return
        }
        failSession(session, SPEED_TEST_ERROR.TIMEOUT)
      }, SPEED_TEST_CONFIG.overallTestTimeoutMs)

      try {
        const outcome = await orchestrator.run({
          onPhase: (phase, isp, server) => {
            if (!isCurrent(session)) {
              return
            }
            if (phase === "preparing_download" || phase === "download") {
              window.clearTimeout(watchdog)
            }
            phaseRef.current = phase
            setState((current) => ({
              ...current,
              phase,
              ispLabel: isp,
              serverLabel: server,
              error: null,
            }))
          },
          onPing: (ping) => {
            if (!isCurrent(session)) {
              return
            }
            setState((current) => ({ ...current, pingMs: ping }))
          },
          onLatencyStats: (pingMs, jitterMs, packetLossPercent) => {
            if (!isCurrent(session)) {
              return
            }
            setState((current) => ({
              ...current,
              pingMs,
              jitterMs,
              packetLossPercent,
            }))
          },
          onDownload: (speed) => {
            if (!isCurrent(session) || speed < 0) {
              return
            }
            downloadEmaRef.current =
              speed === 0 ? 0 : smoothLiveMbps(downloadEmaRef.current, speed)
            const live = downloadEmaRef.current
            setState((current) => ({
              ...current,
              liveDownloadMbps: live,
              downloadHistory: [...current.downloadHistory, live].slice(-200),
            }))
          },
          onUpload: (speed) => {
            if (!isCurrent(session) || speed < 0) {
              return
            }
            uploadEmaRef.current =
              speed === 0 ? 0 : smoothLiveMbps(uploadEmaRef.current, speed)
            const live = uploadEmaRef.current
            setState((current) => ({
              ...current,
              liveUploadMbps: live,
              uploadHistory: [...current.uploadHistory, live].slice(-200),
            }))
          },
        })

        if (!isCurrent(session)) {
          return
        }
        window.clearTimeout(watchdog)
        window.clearTimeout(overall)

        if (!isValidOutcome(outcome)) {
          failSession(session, SPEED_TEST_ERROR.FAILED)
          return
        }

        setState((current) => ({
          ...current,
          phase: "saving",
        }))
        phaseRef.current = "saving"
        await delay(400, abort.signal).catch(() => undefined)
        if (!isCurrent(session)) {
          return
        }

        const result = buildSpeedTestResult(outcome)
        if (!isCurrent(session)) {
          return
        }
        logSpeedTestSession(testSessionId, "completed")
        phaseRef.current = "finished"
        setState((current) => ({
          ...current,
          phase: "finished",
          result,
          liveDownloadMbps: result.download,
          liveUploadMbps: result.upload,
          pingMs: result.ping,
          jitterMs: result.jitter,
          packetLossPercent: result.loss,
        }))
      } catch (error) {
        if (!isCurrent(session)) {
          return
        }
        window.clearTimeout(watchdog)
        window.clearTimeout(overall)
        if (isAbortError(error)) {
          logSpeedTestSession(testSessionId, "failed", {
            phase: phaseRef.current,
            abortReason: error instanceof Error ? error.message : "aborted",
            ...describeError(error),
          })
          return
        }
        logSpeedTestSession(testSessionId, "failed", {
          phase: phaseRef.current,
          mappedError: mapError(error, navigator.onLine),
          online: navigator.onLine,
          ...describeError(error),
        })
        failSession(session, mapError(error, navigator.onLine))
      } finally {
        window.clearTimeout(watchdog)
        window.clearTimeout(overall)
      }
    })()
  }, [failSession, isCurrent])

  const togglePause = useCallback(() => {
    const orchestrator = orchestratorRef.current
    if (!orchestrator) {
      return
    }
    if (orchestrator.isPaused) {
      if (!navigator.onLine) {
        return
      }
      orchestrator.resume()
      hiddenPauseRef.current = false
      setState((current) => ({
        ...current,
        isPaused: false,
        pausedByConnectivity: false,
      }))
      return
    }
    orchestrator.pause()
    setState((current) => ({ ...current, isPaused: true }))
  }, [])

  const retest = useCallback(() => {
    startTest()
  }, [startTest])

  useEffect(() => {
    function onOnline() {
      setState((current) => {
        if (
          current.error === SPEED_TEST_ERROR.OFFLINE ||
          current.error === SPEED_TEST_ERROR.NO_CONNECTION
        ) {
          queueMicrotask(() => startTest())
        } else if (
          current.pausedByConnectivity &&
          MEASURING_PHASES.includes(current.phase)
        ) {
          orchestratorRef.current?.resume()
          return {
            ...current,
            isPaused: false,
            pausedByConnectivity: false,
          }
        }
        return current
      })
    }

    function onOffline() {
      setState((current) => {
        if (current.phase === "connecting") {
          queueMicrotask(() =>
            failSession(sessionIdRef.current, SPEED_TEST_ERROR.OFFLINE)
          )
          return current
        }
        if (MEASURING_PHASES.includes(current.phase) && current.result == null) {
          orchestratorRef.current?.pause()
          return {
            ...current,
            isPaused: true,
            pausedByConnectivity: true,
          }
        }
        return current
      })
    }

    function onVisibility() {
      const orchestrator = orchestratorRef.current
      if (!orchestrator) {
        return
      }
      setState((current) => {
        if (!MEASURING_PHASES.includes(current.phase)) {
          return current
        }
        if (document.hidden) {
          if (!orchestrator.isPaused) {
            orchestrator.pause()
            hiddenPauseRef.current = true
            return { ...current, isPaused: true }
          }
          return current
        }
        if (hiddenPauseRef.current && navigator.onLine) {
          orchestrator.resume()
          hiddenPauseRef.current = false
          return { ...current, isPaused: false }
        }
        return current
      })
    }

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [failSession, startTest])

  useEffect(() => {
    return () => {
      if (abortRef.current || orchestratorRef.current) {
        logSpeedTestSession(testSessionIdRef.current || "none", "unmount cleanup")
      }
      abortRef.current?.abort()
      orchestratorRef.current?.close()
    }
  }, [])

  return {
    ...state,
    startTest,
    stopTest,
    retest,
    togglePause,
  }
}
