import type { Metadata } from "next"

import {
  ContentPage,
  LegalBlocks,
  LegalContact,
  LegalSection,
} from "@/components/shared/content-page"
import { termsDocument } from "@/lib/content/legal"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: termsDocument.title,
  description: termsDocument.description,
  path: "/terms",
})

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow={termsDocument.eyebrow}
      title={termsDocument.title}
      meta={termsDocument.meta}
    >
      <div className="text-sm leading-5 text-muted-foreground">
        <LegalBlocks blocks={termsDocument.intro} bodySize="sm" />
      </div>

      <div>
        {termsDocument.sections.map((section) => (
          <LegalSection
            key={section.id}
            id={section.id}
            title={section.title}
            bodySize="sm"
          >
            <LegalBlocks blocks={section.blocks} bodySize="sm" />
          </LegalSection>
        ))}

        <LegalContact
          title={termsDocument.contact.title}
          body={termsDocument.contact.body}
          email={termsDocument.contact.email}
          bodySize="sm"
        />
      </div>
    </ContentPage>
  )
}
