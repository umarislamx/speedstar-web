"use client"

import { Check, ChevronDown } from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import { TurnstileField } from "@/components/shared/turnstile-field"
import { Button } from "@/components/ui/button"
import type {
  ContactApiResponse,
  ContactFieldErrors,
} from "@/lib/contact/types"
import { validateContactForm } from "@/lib/contact/validation"
import {
  contactEmail,
  contactSubjects,
  type ContactSubject,
} from "@/lib/content/contact"
import { cn } from "@/lib/utils"

const fieldClassName =
  "h-10 w-full rounded border border-border bg-background px-3 py-2 text-sm leading-5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const fieldErrorClassName =
  "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState<ContactSubject>("General inquiry")
  const [message, setMessage] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [errors, setErrors] = useState<ContactFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const statusId = useId()

  function resetForm() {
    setName("")
    setEmail("")
    setSubject("General inquiry")
    setMessage("")
    setTurnstileToken("")
    setErrors({})
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    // 1) Frontend validation — never call the backend with empty/invalid fields.
    const validation = validateContactForm({
      name,
      email,
      subject,
      message,
      turnstileToken,
    })

    if (!validation.ok) {
      setErrors(validation.fields)
      if (validation.fields.form) {
        setFormError(validation.fields.form)
      }
      return
    }

    const turnstileConfigured = Boolean(
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    )
    if (turnstileConfigured && !turnstileToken) {
      setFormError("Please complete the security check and try again.")
      return
    }

    setErrors({})
    setIsSubmitting(true)

    // 2) Backend submission — email + Google Sheets via /api/contact.
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validation.data,
          turnstileToken,
        }),
      })

      const result = (await response.json()) as ContactApiResponse

      if (!result.ok) {
        if (result.fields) {
          setErrors(result.fields)
        }
        setFormError(
          result.message ||
            "We couldn't send your message right now. Please try again."
        )
        return
      }

      setSucceeded(true)
      resetForm()
    } catch {
      setFormError(
        "Network error. Please check your connection and try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (succeeded) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-start gap-3 rounded-xl border border-border bg-muted/40 px-5 py-6 sm:px-6"
      >
        <div className="flex items-center gap-2 text-foreground">
          <span
            aria-hidden="true"
            className="inline-flex size-6 items-center justify-center rounded-full bg-foreground text-background"
          >
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-base font-semibold leading-6">Thank you!</p>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#52525b] dark:text-[#a1a1aa]">
          We&apos;ve received your message and usually respond within one
          business day.
        </p>
        <Button
          type="button"
          variant="outline"
          size="cta"
          className="mt-1 border-border bg-background"
          onClick={() => setSucceeded(false)}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-5 sm:space-y-6"
      noValidate
      aria-describedby={formError ? statusId : undefined}
    >
      {formError ? (
        <p
          id={statusId}
          role="alert"
          className="text-sm leading-5 text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
        <Field id="name" label="Name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Umar"
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(fieldClassName, errors.name && fieldErrorClassName)}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alex@example.com"
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(fieldClassName, errors.email && fieldErrorClassName)}
          />
        </Field>
      </div>

      <SubjectSelect
        value={subject}
        onChange={setSubject}
        error={errors.subject}
      />

      <Field id="message" label="Message" error={errors.message} labelGap="tight">
        <textarea
          id="message"
          name="message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what's on your mind..."
          aria-invalid={Boolean(errors.message) || undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(
            "min-h-20 w-full resize-y rounded border border-border bg-background px-3 py-2 text-sm leading-5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            errors.message && fieldErrorClassName
          )}
        />
      </Field>

      <TurnstileField
        onToken={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
        onError={() =>
          setFormError("Security verification failed. Please try again.")
        }
      />

      <div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center sm:gap-8">
        <Button type="submit" size="cta" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
        <p className="text-xs leading-4 text-muted-foreground">
          You can also email us at{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="underline underline-offset-2"
          >
            {contactEmail}
          </a>
        </p>
      </div>
    </form>
  )
}

type FieldProps = {
  id: string
  label: string
  error?: string
  labelGap?: "default" | "tight"
  children: ReactNode
}

function Field({
  id,
  label,
  error,
  labelGap = "default",
  children,
}: FieldProps) {
  return (
    <div
      className={cn(
        "min-w-0",
        labelGap === "tight" ? "space-y-1.5" : "space-y-2"
      )}
    >
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none text-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm leading-5 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type SubjectSelectProps = {
  value: ContactSubject
  onChange: (value: ContactSubject) => void
  error?: string
}

function SubjectSelect({ value, onChange, error }: SubjectSelectProps) {
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
        aria-invalid={Boolean(error) || undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          fieldClassName,
          "inline-flex items-center justify-between gap-2 text-left",
          error && fieldErrorClassName
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
      {error ? (
        <p role="alert" className="text-sm leading-5 text-destructive">
          {error}
        </p>
      ) : null}

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
