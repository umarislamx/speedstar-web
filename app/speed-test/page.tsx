import type { Metadata } from "next"

import { SpeedTestExperience } from "@/components/speed-test/speed-test-experience"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Speed Test",
  description:
    "Run a SpeedStar internet speed test in the browser. Guest mode — no account required.",
  path: "/speed-test",
})

export default function SpeedTestPage() {
  return <SpeedTestExperience />
}
