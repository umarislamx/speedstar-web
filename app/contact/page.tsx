import type { Metadata } from "next"

import { ContactForm } from "@/components/shared/contact-form"
import { ContentPage } from "@/components/shared/content-page"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Get in touch with the SpeedStar team. We read every message and respond within one business day.",
  path: "/contact",
})

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Get in touch."
      description="We read every message and respond within one business day."
      className="max-w-[576px]"
      headerClassName="mb-10 sm:mb-12"
      descriptionClassName="sm:pt-4 sm:text-base sm:leading-6 md:pt-4"
    >
      <ContactForm />
    </ContentPage>
  )
}
