import type { Metadata } from "next"
import Link from "next/link"

import { ContentPage } from "@/components/shared/content-page"
import { FaqAccordion } from "@/components/shared/faq-accordion"
import { buttonVariants } from "@/components/ui/button"
import { supportFaqItems } from "@/lib/content/support-faq"
import { createPageMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"

export const metadata: Metadata = createPageMetadata({
  title: "Support",
  description:
    "Answers to common questions about SpeedStar and your test results.",
  path: "/support",
})

export default function SupportPage() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Frequently asked questions."
      description="Answers to common questions about SpeedStar and your test results."
      descriptionClassName="sm:pt-4 sm:text-base sm:leading-6 md:pt-4"
      headerClassName="mb-10 sm:mb-12 md:mb-14"
    >
      <FaqAccordion items={supportFaqItems} />

      {/*
        Figma 16324:20302 — exact dark tokens from get_variable_defs:
        muted #0c0e12 · border #27272a · muted-foreground #a1a1aa
        secondary button #fafafa / #0c0e12 · radius 16 · padding 24
      */}
      <aside className="mt-12 flex w-full min-w-0 flex-col items-center rounded-[16px] border border-[#e4e4e7] bg-[#f4f4f5] p-5 text-center sm:mt-16 sm:p-6 dark:border-[#27272a] dark:bg-[#0c0e12]">
        <p className="text-sm font-medium leading-5 text-[#0c0e12] dark:text-[#fafafa]">
          Still have questions?
        </p>
        <div className="flex w-full flex-col items-center pb-4 pt-1.5">
          <p className="max-w-[28rem] text-sm font-normal leading-5 text-[#71717a] dark:text-[#a1a1aa]">
            We read every message and respond within one business day.
          </p>
        </div>
        <Link
          href="/contact"
          className={cn(
            buttonVariants({ variant: "default", size: "cta" }),
            "bg-[#0c0e12] text-[#fafafa] hover:bg-[#0c0e12]/90 dark:bg-[#fafafa] dark:text-[#0c0e12] dark:hover:bg-[#fafafa]/90"
          )}
        >
          Contact us
        </Link>
      </aside>
    </ContentPage>
  )
}
