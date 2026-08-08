"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

type Theme = "dark" | "light"

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark"
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(getInitialTheme())
    setMounted(true)
  }, [])

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark"
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
    setTheme(nextTheme)
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 shrink-0 border-0 bg-transparent p-2 text-muted-links opacity-50 shadow-none hover:bg-transparent hover:text-muted-links hover:opacity-80 dark:hover:bg-transparent"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {mounted && theme === "light" ? (
        <Moon className="size-5" aria-hidden="true" />
      ) : (
        <Sun className="size-5" aria-hidden="true" />
      )}
    </Button>
  )
}
