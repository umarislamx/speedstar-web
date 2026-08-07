import type { Metadata } from "next"

import { ContentPage, LegalSection } from "@/components/shared/content-page"
import { termsSections } from "@/lib/content/legal"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms governing use of the SpeedStar website and applications. Placeholder terms pending final legal content.",
  path: "/terms",
})

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Terms of Service"
      meta="Effective Date: August 5, 2026"
    >
      <p className="text-base leading-6 text-muted-foreground">
        Placeholder introduction — final Terms of Service content will be added
        later.
      </p>

      <div className="pt-6">
        {termsSections.map((title) => (
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
