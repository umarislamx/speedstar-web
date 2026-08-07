import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ContentPageProps = {
  eyebrow: string
  title: string
  description?: string
  meta?: string
  children: ReactNode
  className?: string
  headerClassName?: string
  descriptionClassName?: string
}

export function ContentPage({
  eyebrow,
  title,
  description,
  meta,
  children,
  className,
  headerClassName,
  descriptionClassName,
}: ContentPageProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[672px] min-w-0 flex-1 flex-col px-4 py-12 sm:px-8 sm:py-16 md:px-10 md:py-20 lg:px-20 lg:py-28",
          className
        )}
      >
        <header className={cn("mb-10 space-y-0 sm:mb-12 md:mb-14", headerClassName)}>
          <p className="text-xs font-medium uppercase leading-4 text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="pt-4 text-[2rem] font-semibold leading-10 tracking-tight text-foreground sm:pt-6 sm:text-4xl sm:leading-[2.75rem] md:text-[48px] md:leading-[58px] md:tracking-[-0.8px]">
            {title}
          </h1>
          {meta ? (
            <p className="pt-3 text-sm leading-5 text-muted-foreground sm:pt-4">
              {meta}
            </p>
          ) : null}
          {description ? (
            <p
              className={cn(
                "max-w-prose pt-3 text-base leading-6 text-muted-foreground sm:pt-4 sm:text-lg sm:leading-7 md:pt-8",
                descriptionClassName
              )}
            >
              {description}
            </p>
          ) : null}
        </header>
        <div className="flex min-w-0 flex-col">{children}</div>
      </div>
    </div>
  )
}

type ContentBlockProps = {
  label: string
  children: ReactNode
  id?: string
  className?: string
}

export function ContentBlock({
  label,
  children,
  id,
  className,
}: ContentBlockProps) {
  const headingId = id ? `${id}-heading` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 sm:scroll-mt-28", className)}
    >
      <h2
        id={headingId}
        className="text-xs font-medium uppercase leading-4 text-muted-foreground"
      >
        {label}
      </h2>
      <div className="pt-3 text-base leading-6 text-muted-foreground sm:pt-4">
        {children}
      </div>
    </section>
  )
}

export function ContentDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("my-10 h-px w-full bg-border sm:my-12 md:my-14", className)}
      aria-hidden="true"
    />
  )
}

type NumberedStepProps = {
  number: string
  title: string
  children: ReactNode
}

export function NumberedStep({ number, title, children }: NumberedStepProps) {
  return (
    <div className="flex gap-4 sm:gap-6">
      <p className="shrink-0 pt-0.5 text-xs leading-4 text-muted-foreground">
        {number}
      </p>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold leading-5 text-foreground">
          {title}
        </h3>
        <p className="pt-1.5 text-sm leading-5 text-muted-foreground">
          {children}
        </p>
      </div>
    </div>
  )
}

type LegalSectionProps = {
  title: string
  children?: ReactNode
  id?: string
}

export function LegalSection({ title, children, id }: LegalSectionProps) {
  const headingId = id ? `${id}-heading` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-24 pt-8 first:pt-0 sm:scroll-mt-28 sm:pt-10"
    >
      <h2
        id={headingId}
        className="text-xl font-medium leading-8 tracking-tight text-foreground sm:text-2xl sm:leading-9 md:text-[30px] md:leading-9"
      >
        {title}
      </h2>
      <div className="space-y-4 pt-3 text-base leading-6 text-muted-foreground">
        {children ?? (
          <p>Placeholder content — final legal copy will be added later.</p>
        )}
      </div>
    </section>
  )
}
