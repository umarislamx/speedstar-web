"use client"

import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useState } from "react"

import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { headerNav } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 sm:h-20 sm:px-8 lg:px-20">
        <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-16">
            <Link
              href="/"
              className="inline-flex shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="SpeedStar home"
            >
              <Image
                src="/icons/speedstar-logo-light.svg"
                alt="SpeedStar"
                width={127}
                height={32}
                className="h-7 w-auto sm:h-8 dark:hidden"
                priority
              />
              <Image
                src="/icons/speedstar-logo-dark.svg"
                alt="SpeedStar"
                width={127}
                height={32}
                className="hidden h-7 w-auto sm:h-8 dark:block"
                priority
              />
            </Link>

            <nav
              className="hidden items-center gap-4 lg:gap-6 md:flex"
              aria-label="Primary"
            >
              {headerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-sm px-1 text-sm font-medium text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button type="button" size="cta" className="opacity-50" disabled>
              Download
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0 rounded-full border-border bg-background"
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        id={menuId}
        className={cn(
          "border-t border-border bg-background md:hidden",
          isMenuOpen ? "block" : "hidden"
        )}
      >
        <nav
          className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-4 py-3 sm:px-8"
          aria-label="Mobile primary"
        >
          {headerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {item.label}
            </Link>
          ))}
          <span
            className={cn(
              buttonVariants({ variant: "default", size: "cta" }),
              "mt-2 w-full opacity-50"
            )}
            aria-disabled="true"
          >
            Download
          </span>
        </nav>
      </div>
    </header>
  )
}
