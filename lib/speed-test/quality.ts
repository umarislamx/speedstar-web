import type { NetworkQuality, QualityRating } from "@/lib/speed-test/types"

function ratingLabel(rating: QualityRating): "Good" | "Medium" | "Bad" {
  if (rating === "good") {
    return "Good"
  }
  if (rating === "medium") {
    return "Medium"
  }
  return "Bad"
}

/**
 * Port of Android `SpeedTestViewModel.deriveQuality`.
 */
export function deriveQuality(
  downloadMbps: number,
  uploadMbps: number,
  pingMs: number
): NetworkQuality {
  const videoStreaming: QualityRating =
    downloadMbps >= 25 ? "good" : downloadMbps >= 5 ? "medium" : "bad"

  const onlineGaming: QualityRating =
    pingMs >= 1 && pingMs <= 49
      ? "good"
      : pingMs >= 50 && pingMs <= 99
        ? "medium"
        : "bad"

  const videoChatting: QualityRating =
    uploadMbps >= 5 && pingMs < 80
      ? "good"
      : uploadMbps >= 2
        ? "medium"
        : "bad"

  return {
    videoStreaming,
    onlineGaming,
    videoChatting,
  }
}

export function qualityRatingLabel(rating: QualityRating): "Good" | "Medium" | "Bad" {
  return ratingLabel(rating)
}
