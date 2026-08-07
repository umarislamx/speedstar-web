"use client"

import { Check, ChevronDown } from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"

import { Button } from "@/components/ui/button"
import {
  contactSubjects,
  type ContactSubject,
} from "@/lib/content/contact"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-10 w-full rounded border border-border bg-background px-3 py-2 text-sm leading-5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [subject, setSubject] = useState<ContactSubject>("General inquiry")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p
        role="status"
        className="rounded-lg border border-border bg-muted p-6 text-sm leading-5 text-muted-foreground"
      >
        Thanks — your message is ready to send once the contact backend is
        connected. This is a placeholder confirmation.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-5 sm:space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0 space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="e.g Umar Abdullah"
            className={fieldClassName}
          />
        </div>

        <div className="min-w-0 space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="alex@example.com"
            className={fieldClassName}
          />
        </div>
      </div>

      <SubjectSelect value={subject} onChange={setSubject} />
      <input type="hidden" name="subject" value={subject} />

      <div className="space-y-1.5">
        <label
          htmlFor="message"
          className="text-sm font-medium leading-none text-foreground"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us what's on your mind..."
          className="min-h-20 w-full resize-y rounded border border-border bg-background px-3 py-2 text-sm leading-5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" size="cta">
          Send message
        </Button>
      </div>
    </form>
  )
}

type SubjectSelectProps = {
  value: ContactSubject
  onChange: (value: ContactSubject) => void
}

function SubjectSelect({ value, onChange }: SubjectSelectProps) {
  const listboxId = useId()
  const labelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, contactSubjects.indexOf(value))
  )

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  function selectOption(option: ContactSubject) {
    onChange(option)
    setOpen(false)
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(Math.max(0, contactSubjects.indexOf(value)))
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % contactSubjects.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((current) =>
        current === 0 ? contactSubjects.length - 1 : current - 1
      )
    } else if (event.key === "Home") {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === "End") {
      event.preventDefault()
      setActiveIndex(contactSubjects.length - 1)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      selectOption(contactSubjects[activeIndex])
    } else if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0 space-y-2">
      <p id={labelId} className="text-sm font-medium leading-none text-foreground">
        Subject
      </p>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          fieldClassName,
          "inline-flex items-center justify-between gap-2 text-left"
        )}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"
        >
          {contactSubjects.map((option, index) => {
            const selected = option === value
            const active = index === activeIndex

            return (
              <li key={option} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={cn(
                    "relative flex w-full items-center rounded-sm py-1.5 pr-2 pl-8 text-left text-sm leading-5 outline-none",
                    (active || selected) && "bg-accent text-accent-foreground",
                    !active && !selected && "hover:bg-accent/70"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                >
                  {selected ? (
                    <Check
                      className="absolute left-2 size-4 text-foreground"
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                  ) : null}
                  {option}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
