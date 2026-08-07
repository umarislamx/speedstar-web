import type { Metadata } from "next"

import { ContentPage, LegalSection } from "@/components/shared/content-page"
import { privacySections } from "@/lib/content/legal"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How SpeedStar collects, uses, and protects your information. Placeholder policy pending final legal content.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Privacy Policy"
      meta="Effective Date: August 5, 2026"
    >
      <p className="text-base leading-6 text-muted-foreground">
        Placeholder introduction — final Privacy Policy content will be added
        later.
      </p>

      <div className="pt-6">
        {privacySections.map((title) => (
          <LegalSection
            key={title}
            id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            title={title}
          />
        ))}
      </div>
    </ContentPage>
  )
}
