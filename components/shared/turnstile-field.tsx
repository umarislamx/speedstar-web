"use client"

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useRef } from "react"

type TurnstileFieldProps = {
  onToken: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

export function TurnstileField({
  onToken,
  onExpire,
  onError,
}: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<TurnstileInstance | null>(null)

  if (!siteKey) {
    return null
  }

  return (
    <div className="min-h-[1px]">
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        options={{
          size: "invisible",
          theme: "auto",
        }}
        onSuccess={onToken}
        onExpire={() => {
          onExpire?.()
          ref.current?.reset()
        }}
        onError={() => {
          onError?.()
        }}
      />
    </div>
  )
}
