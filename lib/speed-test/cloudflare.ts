import { SPEED_TEST_CONFIG } from "@/lib/speed-test/config"
import type { ServerEndpoint } from "@/lib/speed-test/types"

const BASE_URL = "https://speed.cloudflare.com"

export const CLOUDFLARE_ENDPOINTS = {
  baseUrl: BASE_URL,
  uploadUrl: `${BASE_URL}/__up`,
  pingUrl: `${BASE_URL}/__down?bytes=0`,
  traceUrl: `${BASE_URL}/cdn-cgi/trace`,
} as const

export function cloudflareDownloadUrl(
  bytes: number = SPEED_TEST_CONFIG.downloadRequestBytes
): string {
  return `${BASE_URL}/__down?bytes=${bytes}`
}

type ColoLocation = {
  city: string
  lat: number
  lon: number
}

const COLO_LOCATIONS: Record<string, ColoLocation> = {
  KHI: { city: "Karachi", lat: 24.9008, lon: 67.1681 },
  LHE: { city: "Lahore", lat: 31.5216, lon: 74.4036 },
  ISB: { city: "Islamabad", lat: 33.6149, lon: 73.0993 },
  DEL: { city: "New Delhi", lat: 28.5562, lon: 77.1 },
  BOM: { city: "Mumbai", lat: 19.0896, lon: 72.8656 },
  MAA: { city: "Chennai", lat: 12.9941, lon: 80.1709 },
  BLR: { city: "Bengaluru", lat: 13.1986, lon: 77.7066 },
  DXB: { city: "Dubai", lat: 25.2532, lon: 55.3657 },
  SIN: { city: "Singapore", lat: 1.3592, lon: 103.9894 },
  HKG: { city: "Hong Kong", lat: 22.308, lon: 113.9185 },
  FRA: { city: "Frankfurt", lat: 50.0379, lon: 8.5622 },
  AMS: { city: "Amsterdam", lat: 52.3105, lon: 4.7683 },
  LHR: { city: "London", lat: 51.47, lon: -0.4543 },
  IAD: { city: "Ashburn", lat: 38.9445, lon: -77.4558 },
  LAX: { city: "Los Angeles", lat: 33.9416, lon: -118.4085 },
  ORD: { city: "Chicago", lat: 41.9742, lon: -87.9073 },
  NRT: { city: "Tokyo", lat: 35.772, lon: 140.3929 },
  ICN: { city: "Seoul", lat: 37.4602, lon: 126.4407 },
  SYD: { city: "Sydney", lat: -33.9399, lon: 151.1753 },
}

export function coloDisplayName(colo: string): string {
  const location = COLO_LOCATIONS[colo]
  if (location) {
    return `${location.city} (${colo})`
  }
  if (colo) {
    return `Cloudflare (${colo})`
  }
  return "Cloudflare"
}

export function coloCoordinates(
  colo: string
): { lat: number; lon: number } | null {
  const location = COLO_LOCATIONS[colo]
  if (!location) {
    return null
  }
  return { lat: location.lat, lon: location.lon }
}

export function createCloudflareEndpoint(colo = ""): ServerEndpoint {
  const coords = coloCoordinates(colo)
  return {
    id: `cf-${colo || "anycast"}`,
    displayName: coloDisplayName(colo),
    providerId: "cloudflare",
    downloadUrl: cloudflareDownloadUrl(),
    uploadUrl: CLOUDFLARE_ENDPOINTS.uploadUrl,
    pingUrl: CLOUDFLARE_ENDPOINTS.pingUrl,
    latitude: coords?.lat ?? null,
    longitude: coords?.lon ?? null,
    regionTag: colo || "anycast",
  }
}

export function withDownloadBytes(
  endpoint: ServerEndpoint,
  bytes: number
): ServerEndpoint {
  if (endpoint.providerId !== "cloudflare") {
    return endpoint
  }
  return {
    ...endpoint,
    downloadUrl: cloudflareDownloadUrl(bytes),
  }
}
