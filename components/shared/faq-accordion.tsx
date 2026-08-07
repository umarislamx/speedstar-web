"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Plus } from "lucide-react"
import { useId, useState } from "react"

import { cn } from "@/lib/utils"

export type FaqItem = {
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: FaqItem[]
}

const accordionEase = [0.32, 0.72, 0, 1] as const

export function FaqAccordion({ items }: FaqAccordionProps) {
  const baseId = useId()
  const reduceMotion = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="w-full min-w-0">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`
        const duration = reduceMotion ? 0 : 0.45
        const iconDuration = reduceMotion ? 0 : 0.35

        return (
          <div
            key={item.question}
            className={cn(index > 0 && "border-t border-border")}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full min-h-11 items-start gap-4 py-4 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-6 sm:py-5"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">
                  {item.question}
                </span>
                <motion.span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center text-foreground"
                  initial={false}
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{
                    duration: iconDuration,
                    ease: accordionEase,
                  }}
                >
                  <Plus className="size-3" strokeWidth={1.75} />
                </motion.span>
              </button>
            </h3>

            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              initial={false}
              animate={{
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
              }}
              transition={{
                height: {
                  duration,
                  ease: accordionEase,
                },
                opacity: {
                  duration: reduceMotion ? 0 : 0.28,
                  ease: "easeOut",
                  delay: isOpen && !reduceMotion ? 0.06 : 0,
                },
              }}
              className="overflow-hidden"
            >
              <p
                className="pb-4 text-sm leading-5 text-muted-foreground sm:pb-5"
                inert={!isOpen ? true : undefined}
              >
                {item.answer}
              </p>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
