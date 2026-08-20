import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { speedTestErrorCopy } from "@/lib/speed-test/errors"

type ErrorStateProps = {
  error: string
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const copy = speedTestErrorCopy(error)

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-base font-semibold">{copy.title}</h1>
      <p className="mt-2 max-w-md text-base text-muted-foreground">{copy.body}</p>
      <Button type="button" size="cta" className="mt-6" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  )
}
