import type { FaqItem } from "@/components/shared/faq-accordion"

/** FAQ copy from Figma `/ Support` (all open states). */
export const supportFaqItems: FaqItem[] = [
  {
    question: "How does SpeedStar measure my internet speed?",
    answer:
      "SpeedStar connects to the nearest server in our global network, measures round-trip latency, then transfers data in both directions to calculate your download and upload speeds. The entire test takes under 10 seconds and uses your actual connection — not a cached or optimistic sample.",
  },
  {
    question: "What factors affect my test results?",
    answer:
      "Your results depend on your ISP, network hardware, device performance, and current network activity. Testing over Wi-Fi introduces additional variables. For the most accurate result, test from a device connected directly via Ethernet and close other applications that may be using bandwidth.",
  },
  {
    question: "How often should I test my connection?",
    answer:
      "We recommend testing periodically — especially if you notice slowdowns during video calls, streaming, or gaming. Testing at different times of day can reveal congestion patterns specific to your ISP or local network.",
  },
  {
    question: "Why are my results different from my ISP's advertised speed?",
    answer:
      "ISPs advertise theoretical maximum speeds under ideal conditions. Real-world performance depends on network congestion, the quality of infrastructure in your area, routing between your home and the server, and the type of connection (shared cable vs. dedicated fiber). SpeedStar measures what you actually get.",
  },
  {
    question: "Does SpeedStar store my test results?",
    answer:
      "By default, test results are not stored or associated with any account. The Results Share feature encodes your data locally in the URL — nothing is sent to our servers unless you explicitly sign in and save results.",
  },
  {
    question: "What do latency and jitter mean?",
    answer:
      "Latency (or ping) is the time it takes a packet to travel from your device to the server and back, measured in milliseconds. Lower is better. Jitter measures how much latency varies from packet to packet — low jitter means a stable connection, which matters for gaming, voice calls, and video conferencing.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach us through the Contact page. We read every message and respond within one business day.",
  },
]
