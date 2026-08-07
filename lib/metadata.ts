import type { Metadata } from "next"

import { siteConfig } from "@/lib/site"

type CreatePageMetadataInput = {
  title: string
  description: string
  path: `/${string}`
}

export function createPageMetadata({
  title,
  description,
  path,
}: CreatePageMetadataInput): Metadata {
  const url = path

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
      images: [
        {
          url: siteConfig.ogImage.url,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          alt: siteConfig.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
      images: [
        {
          url: siteConfig.ogImage.url,
          alt: siteConfig.ogImage.alt,
        },
      ],
    },
  }
}
