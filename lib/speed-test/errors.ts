/**
 * User-facing engine errors.
 * Port of SpeedStar Android `SpeedTestViewModel` error constants and
 * `ConnectionErrorContent` titles/bodies.
 */
export const SPEED_TEST_ERROR = {
  OFFLINE: "No internet connection detected",
  NO_CONNECTION: "No internet connection detected",
  TIMEOUT: "Request timed out. Please try again.",
  FAILED: "Speed test failed. Please try again.",
  SAVE: "Could not save this result. You can retry from Results.",
} as const

export type SpeedTestErrorMessage =
  (typeof SPEED_TEST_ERROR)[keyof typeof SPEED_TEST_ERROR]

export type SpeedTestErrorCopy = {
  title: string
  body: string
}

export function speedTestErrorCopy(error: string): SpeedTestErrorCopy {
  if (
    error === SPEED_TEST_ERROR.OFFLINE ||
    error === SPEED_TEST_ERROR.NO_CONNECTION
  ) {
    return {
      title: "No connection found.",
      body: "Your device appears to be offline. Please reconnect and try again.",
    }
  }

  if (error === SPEED_TEST_ERROR.TIMEOUT) {
    return {
      title: "Request timed out",
      body: "The test took too long to finish. Please try again.",
    }
  }

  if (error === SPEED_TEST_ERROR.SAVE) {
    return {
      title: "Couldn’t save results",
      body: "The speed test finished, but saving failed. Please try again.",
    }
  }

  return {
    title: "Something went wrong",
    body: "Please try again.",
  }
}
