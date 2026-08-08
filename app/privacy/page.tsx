import type { Metadata } from "next"

import {
  ContentPage,
  LegalBlocks,
  LegalContact,
  LegalSection,
} from "@/components/shared/content-page"
import { privacyDocument } from "@/lib/content/legal"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: privacyDocument.title,
  description: privacyDocument.description,
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow={privacyDocument.eyebrow}
      title={privacyDocument.title}
      meta={privacyDocument.meta}
    >
      <div className="text-base leading-6 text-muted-foreground">
        <LegalBlocks blocks={privacyDocument.intro} bodySize="base" />
      </div>

      <div>
        {privacyDocument.sections.map((section) => (
          <LegalSection
            key={section.id}
            id={section.id}
            title={section.title}
            bodySize="base"
          >
            <LegalBlocks blocks={section.blocks} bodySize="base" />
          </LegalSection>
        ))}

        <LegalContact
          title={privacyDocument.contact.title}
          body={privacyDocument.contact.body}
          email={privacyDocument.contact.email}
          websiteLabel={privacyDocument.contact.websiteLabel}
          websiteHref={privacyDocument.contact.websiteHref}
          bodySize="sm"
        />
      </div>
    </ContentPage>
  )
}
