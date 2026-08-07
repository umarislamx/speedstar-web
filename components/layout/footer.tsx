import Link from "next/link"

import { footerDownloadLinks, footerNav } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 text-center sm:gap-6 md:flex-row md:items-center md:justify-between md:gap-5 md:text-left">
          <p className="shrink-0 text-xs leading-4 text-[#52525b] dark:text-[#a1a1aa]">
            © 2026 SpeedStar
          </p>

          <nav aria-label="Footer" className="min-w-0">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-x-5">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-end">
            {footerDownloadLinks.map((item) => {
              const isSoon = item.label.toLowerCase().includes("soon")

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-foreground transition-opacity focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isSoon
                        ? "pointer-events-none opacity-50"
                        : "hover:opacity-80"
                    )}
                    aria-disabled={isSoon || undefined}
                    tabIndex={isSoon ? -1 : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </footer>
  )
}
