import type { NavItem } from "@/types/navigation"

/** Figma header: Speed Test · About · Support */
export const headerNav: NavItem[] = [
  { label: "Speed Test", href: "/speed-test" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
]

/** Figma footer: About · Support · Privacy · Terms · Contact */
export const footerNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
]

export const footerDownloadLinks: NavItem[] = [
  { label: "Download Android", href: "#download-android" },
  { label: "iOS — Soon", href: "#ios-soon" },
]
