import type { ReactNode } from "react"

import type { LegalBlock } from "@/lib/content/legal"
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
    <div className="flex min-w-0 flex-1 flex-col px-4 py-12 sm:px-8 sm:py-16 md:px-10 md:py-20 lg:px-20 lg:py-28">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[672px] min-w-0 flex-1 flex-col",
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

type LegalBodySize = "base" | "sm"

const legalBodyClassName: Record<LegalBodySize, string> = {
  base: "text-base leading-6",
  sm: "text-sm leading-5",
}

type LegalSectionProps = {
  title: string
  children?: ReactNode
  id?: string
  /** Privacy uses base (16/24); Terms uses sm (14/20) per Figma. */
  bodySize?: LegalBodySize
  className?: string
}

export function LegalSection({
  title,
  children,
  id,
  bodySize = "base",
  className,
}: LegalSectionProps) {
  const headingId = id ? `${id}-heading` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 pt-10 sm:scroll-mt-28", className)}
    >
      <h2
        id={headingId}
        className="text-xl font-medium leading-8 tracking-tight text-foreground sm:text-2xl sm:leading-9 md:text-[30px] md:leading-9"
      >
        {title}
      </h2>
      <div
        className={cn(
          "pt-3 text-muted-foreground",
          legalBodyClassName[bodySize]
        )}
      >
        {children ?? (
          <p>Placeholder content — final legal copy will be added later.</p>
        )}
      </div>
    </section>
  )
}

type LegalSubsectionProps = {
  title: string
  children: ReactNode
  id?: string
  bodySize?: LegalBodySize
}

export function LegalSubsection({
  title,
  children,
  id,
  bodySize = "base",
}: LegalSubsectionProps) {
  const headingId = id ? `${id}-heading` : undefined

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-24 pt-10 sm:scroll-mt-28"
    >
      <h3
        id={headingId}
        className="text-xl font-medium leading-8 text-foreground sm:text-2xl sm:leading-8"
      >
        {title}
      </h3>
      <div
        className={cn(
          "pt-3 text-muted-foreground",
          legalBodyClassName[bodySize]
        )}
      >
        {children}
      </div>
    </section>
  )
}

type LegalListProps = {
  items: readonly string[]
  after?: string
  className?: string
}

export function LegalList({ items, after, className }: LegalListProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <ul className="list-disc space-y-0 pl-6 marker:text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="pl-0">
            {item}
          </li>
        ))}
      </ul>
      {after ? <p>{after}</p> : null}
    </div>
  )
}

type LegalBlocksProps = {
  blocks: readonly LegalBlock[]
  bodySize?: LegalBodySize
}

function renderLeafBlock(block: Exclude<LegalBlock, { type: "subsection" }>) {
  if (block.type === "list") {
    return <LegalList items={block.items} after={block.after} />
  }

  return <p>{block.text}</p>
}

export function LegalBlocks({ blocks, bodySize = "base" }: LegalBlocksProps) {
  const nodes: ReactNode[] = []
  let leafRun: Exclude<LegalBlock, { type: "subsection" }>[] = []

  const flushLeafRun = (key: string) => {
    if (leafRun.length === 0) return
    nodes.push(
      <div key={key} className="space-y-5">
        {leafRun.map((block, index) => (
          <div key={`${key}-${index}`}>{renderLeafBlock(block)}</div>
        ))}
      </div>
    )
    leafRun = []
  }

  blocks.forEach((block, index) => {
    if (block.type === "subsection") {
      flushLeafRun(`run-before-${block.id}`)
      nodes.push(
        <LegalSubsection
          key={block.id}
          id={block.id}
          title={block.title}
          bodySize={bodySize}
        >
          <LegalBlocks blocks={block.blocks} bodySize={bodySize} />
        </LegalSubsection>
      )
      return
    }

    leafRun.push(block)
    if (index === blocks.length - 1) {
      flushLeafRun(`run-end-${index}`)
    }
  })

  flushLeafRun("run-trailing")

  return <>{nodes}</>
}

type LegalContactProps = {
  title: string
  body: string
  email: string
  bodySize?: LegalBodySize
}

export function LegalContact({
  title,
  body,
  email,
  bodySize = "sm",
}: LegalContactProps) {
  const headingId = "legal-contact-heading"

  return (
    <section
      id="contact"
      aria-labelledby={headingId}
      className="scroll-mt-24 pt-10 sm:scroll-mt-28"
    >
      <h2
        id={headingId}
        className="text-xl font-medium leading-7 text-foreground"
      >
        {title}
      </h2>
      <div
        className={cn(
          "space-y-3 pt-3 text-muted-foreground",
          legalBodyClassName[bodySize]
        )}
      >
        <p>{body}</p>
        <p>
          Email:{" "}
          <a href={`mailto:${email}`} className="text-foreground">
            {email}
          </a>
        </p>
      </div>
    </section>
  )
}
