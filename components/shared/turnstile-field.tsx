"use client"

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { forwardRef, useState } from "react"

type TurnstileFieldProps = {
  onToken: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export const TurnstileField = forwardRef<
  TurnstileInstance | undefined,
  TurnstileFieldProps
>(function TurnstileField({ onToken, onExpire, onError }, ref) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [status, setStatus] = useState<"idle" | "failed" | "unsupported">(
    "idle"
  )

  if (!siteKey) {
    return null
  }

  return (
    <div className="space-y-2">
      <div
        id="contact-turnstile"
        className="min-h-[65px] w-full overflow-visible"
      >
        <Turnstile
          ref={ref}
          siteKey={siteKey}
          options={{
            size: "flexible",
            theme: "auto",
            appearance: "always",
          }}
          onSuccess={(token) => {
            setStatus("idle")
            onToken(token)
          }}
          onExpire={() => {
            onExpire?.()
          }}
          onError={() => {
            setStatus("failed")
            onError?.()
          }}
          onUnsupported={() => {
            setStatus("unsupported")
            onError?.()
          }}
          onTimeout={() => {
            setStatus("failed")
            onError?.()
          }}
        />
      </div>
      {status === "failed" ? (
        <p role="alert" className="text-sm leading-5 text-destructive">
          Security check failed to load. Please refresh the page and try again.
        </p>
      ) : null}
      {status === "unsupported" ? (
        <p role="alert" className="text-sm leading-5 text-destructive">
          This browser cannot complete the security check. Please try another
          browser.
        </p>
      ) : null}
    </div>
  )
})
