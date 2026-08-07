import Image from "next/image"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HomeHero() {
  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden px-4 sm:px-6">
      <div className="relative mx-auto flex w-full max-w-[900px] flex-col items-center py-6 sm:py-10 md:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 w-full -translate-y-[42%] select-none"
        >
          <Image
            src="/images/gauge-light.svg"
            alt=""
            width={900}
            height={790}
            sizes="(max-width: 900px) 100vw, 900px"
            className="mx-auto h-auto w-full max-w-[900px] dark:hidden"
            priority
          />
          <Image
            src="/images/gauge-dark.svg"
            alt=""
            width={900}
            height={790}
            sizes="(max-width: 900px) 100vw, 900px"
            className="mx-auto hidden h-auto w-full max-w-[900px] dark:block"
            priority
          />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center pt-[clamp(1.75rem,7vw,7.5rem)] text-center">
          <div className="mb-5 flex size-10 items-center justify-center sm:mb-7 sm:size-12">
            <Image
              src="/icons/speedstar-mark-light.svg"
              alt=""
              width={48}
              height={48}
              className="size-10 sm:size-12 dark:hidden"
              priority
            />
            <Image
              src="/icons/speedstar-mark-dark.svg"
              alt=""
              width={48}
              height={48}
              className="hidden size-10 sm:size-12 dark:block"
              priority
            />
          </div>

          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 sm:mb-8">
            <span
              aria-hidden="true"
              className="size-[5px] shrink-0 rounded-[2.5px] bg-muted-foreground"
            />
            <span className="text-xs font-medium uppercase leading-4 text-muted-foreground">
              V1 PREVIEW
            </span>
          </div>

          <h1 className="mb-4 max-w-[460px] text-balance text-[2rem] font-semibold leading-10 tracking-tight text-foreground sm:mb-5 sm:text-4xl sm:leading-[2.75rem] md:max-w-none md:whitespace-nowrap md:text-[48px] md:leading-[58px] md:tracking-[-0.8px]">
            Ready when you are.
          </h1>

          <p className="mb-8 w-full max-w-[460px] text-sm leading-6 text-[#737373] sm:mb-10 sm:text-base dark:text-[#71717a]">
            SpeedStar is currently being refined. We&apos;re building a faster,
            simpler, and more reliable way to understand your internet
            connection. Public launch is coming soon.
          </p>

          <button
            type="button"
            disabled
            className={cn(
              buttonVariants({ variant: "outline", size: "cta" }),
              "gap-1 border-border bg-background opacity-50"
            )}
          >
            <Image
              src="/icons/lock.svg"
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0 invert dark:invert-0"
            />
            Coming Soon
          </button>
        </div>
      </div>
    </section>
  )
}
