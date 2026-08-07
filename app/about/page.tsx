import type { Metadata } from "next"

import {
  ContentBlock,
  ContentDivider,
  ContentPage,
  NumberedStep,
} from "@/components/shared/content-page"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "SpeedStar is a precision internet speed measurement platform built for the modern web.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About"
      title="Clarity over complexity."
      description="SpeedStar is a precision internet speed measurement platform built for the modern web. We believe performance data should be immediate, clear, and honest — without the noise."
    >
      <ContentBlock id="mission" label="Mission">
        <p>
          Most speed testing tools are cluttered with ads, confusing metrics,
          and marketing copy designed to distract rather than inform. SpeedStar
          exists because you deserve a tool that respects your time and gives
          you the truth about your connection — nothing more.
        </p>
      </ContentBlock>

      <ContentDivider />

      <ContentBlock id="how-it-works" label="How it works">
        <div className="space-y-6 pt-2">
          <NumberedStep number="01" title="Connect">
            SpeedStar automatically finds the nearest, least-loaded server from
            our global network — ensuring your result reflects real-world
            conditions, not optimistic lab data.
          </NumberedStep>
          <NumberedStep number="02" title="Measure">
            We test latency, then push and pull data simultaneously to simulate
            real browsing, streaming, and upload behavior. The process takes
            under 10 seconds.
          </NumberedStep>
          <NumberedStep number="03" title="Understand">
            Results are presented in plain language with context. A number
            without explanation is meaningless — we tell you what your speeds
            actually mean for how you use the internet.
          </NumberedStep>
        </div>
      </ContentBlock>

      <ContentDivider />

      <ContentBlock id="technology" label="Technology">
        <p>
          Powered by a global network of test servers optimized for accuracy. We
          use multi-stream testing, adaptive measurement windows, and
          statistical noise reduction to deliver results you can trust. No
          inflated numbers. No favorable conditions.
        </p>
      </ContentBlock>

      <ContentDivider />

      <ContentBlock id="team" label="Team">
        <p>
          Built by a small team of engineers and designers who care deeply about
          performance, simplicity, and craft. We use SpeedStar every day —
          which means we keep making it better.
        </p>
      </ContentBlock>
    </ContentPage>
  )
}
