/**
 * Global site identity used by App Router metadata.
 * Replace placeholder URLs/handles before production launch.
 */
export const siteConfig = {
  name: "SpeedStar",
  shortName: "SpeedStar",
  description:
    "Official website for SpeedStar — a faster, simpler way to understand your internet connection.",
  /** Placeholder production origin — update when the domain is finalized. */
  url: "https://www.speedstar.app",
  locale: "en_US",
  /** Placeholder social share image — add the asset at this path. */
  ogImage: {
    url: "/images/og.png",
    width: 1200,
    height: 630,
    alt: "SpeedStar",
  },
  /** Placeholder X/Twitter handles — update when accounts are ready. */
  twitter: {
    site: "@speedstar",
    creator: "@speedstar",
  },
  themeColor: {
    light: "#ffffff",
    dark: "#09090b",
  },
} as const
