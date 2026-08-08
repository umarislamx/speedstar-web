/** Full Privacy Policy and Terms of Service copy from Figma (MVP1 v2.1). */

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: readonly string[]; after?: string }
  | {
      type: "subsection"
      id: string
      title: string
      blocks: readonly LegalBlock[]
    }

export type LegalSectionContent = {
  id: string
  title: string
  blocks: readonly LegalBlock[]
}

export type LegalDocument = {
  eyebrow: string
  title: string
  meta: string
  description: string
  intro: readonly LegalBlock[]
  sections: readonly LegalSectionContent[]
  contact: {
    title: string
    body: string
    email: string
  }
}

export const privacyDocument: LegalDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  meta: "Effective Date: August 5, 2026",
  description:
    "How SpeedStar collects, uses, and protects your information when you use the SpeedStar app and website.",
  intro: [
    {
      type: "p",
      text: 'Welcome to SpeedStar ("SpeedStar", "we", "our", or "us").',
    },
    {
      type: "p",
      text: "SpeedStar is an internet performance measurement platform that helps users measure, monitor, and better understand the quality of their internet connection through accurate speed tests and network diagnostics.",
    },
    {
      type: "p",
      text: "This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you when using:",
    },
    {
      type: "list",
      items: [
        "SpeedStar Android Application",
        "SpeedStar Website",
        "Future SpeedStar applications and related services",
      ],
      after:
        "By using SpeedStar, you agree to the practices described in this Privacy Policy.",
    },
  ],
  sections: [
    {
      id: "our-privacy-commitment",
      title: "1. Our Privacy Commitment",
      blocks: [
        {
          type: "p",
          text: "Privacy is one of the core principles behind SpeedStar.",
        },
        {
          type: "p",
          text: "We believe users should be able to test their internet connection without creating an account or sharing unnecessary personal information.",
        },
        {
          type: "p",
          text: "The current version of SpeedStar:",
        },
        {
          type: "list",
          items: [
            "does not require registration",
            "does not require sign in",
            "does not require user accounts",
            "stores your speed test history locally on your own device",
            "does not upload your locally stored history to SpeedStar servers",
          ],
          after:
            "We collect only the information necessary to provide, improve, secure, and maintain our services.",
        },
      ],
    },
    {
      id: "information-we-collect",
      title: "2. Information We Collect",
      blocks: [
        {
          type: "p",
          text: "To perform an internet speed test, certain technical information must be processed.",
        },
        {
          type: "p",
          text: "Depending on how you use SpeedStar, we may collect the following categories of information.",
        },
        {
          type: "subsection",
          id: "speed-test-information",
          title: "A. Speed Test Information",
          blocks: [
            {
              type: "p",
              text: "Whenever you start a speed test, SpeedStar measures information such as:",
            },
            {
              type: "list",
              items: [
                "Download speed",
                "Upload speed",
                "Ping (Latency)",
                "Jitter (when supported)",
                "Network response times",
                "Test duration",
                "Selected testing server",
                "Connection type (Wi-Fi, Mobile Data, Ethernet)",
                "Internet Service Provider (ISP), when available",
              ],
              after:
                "This information is required to calculate and display accurate speed test results.",
            },
          ],
        },
        {
          type: "subsection",
          id: "network-information",
          title: "B. Network Information",
          blocks: [
            {
              type: "p",
              text: "During a speed test, internet communications naturally include technical information such as:",
            },
            {
              type: "list",
              items: [
                "Public IP address",
                "Network protocol information",
                "Request and response timing",
                "Connection metadata necessary for testing",
              ],
              after:
                "This information is processed only to perform the requested speed test.",
            },
            {
              type: "p",
              text: "SpeedStar does not use this information to identify individual users.",
            },
          ],
        },
        {
          type: "subsection",
          id: "device-information",
          title: "C. Device Information",
          blocks: [
            {
              type: "p",
              text: "We may receive limited technical information about your device, including:",
            },
            {
              type: "list",
              items: [
                "Device manufacturer",
                "Device model",
                "Android version",
                "Application version",
                "Screen resolution",
                "Device language",
                "Country or region (derived from device settings or network information)",
              ],
              after:
                "This information helps us improve compatibility, troubleshoot issues, and optimize the application.",
            },
          ],
        },
        {
          type: "subsection",
          id: "analytics-information",
          title: "D. Analytics Information",
          blocks: [
            {
              type: "p",
              text: "SpeedStar uses Firebase Analytics to better understand how users interact with the application.",
            },
            {
              type: "list",
              items: [
                "App launches",
                "Feature usage",
                "Session duration",
                "Device type",
                "General usage statistics",
              ],
              after:
                "Analytics information is used only to improve the product and user experience.",
            },
          ],
        },
        {
          type: "subsection",
          id: "crash-diagnostics",
          title: "E. Crash Diagnostics",
          blocks: [
            {
              type: "p",
              text: "SpeedStar uses Firebase Crashlytics to automatically collect crash reports and diagnostic information when unexpected errors occur",
            },
            {
              type: "p",
              text: "Crash reports help us:",
            },
            {
              type: "list",
              items: [
                "fix bugs",
                "improve stability",
                "improve reliability",
                "reduce application crashes",
              ],
              after:
                "Crash reports do not include your locally stored speed test history.",
            },
          ],
        },
        {
          type: "subsection",
          id: "advertising-information",
          title: "F. Advertising Information",
          blocks: [
            {
              type: "p",
              text: "If advertisements are displayed within SpeedStar, Google AdMob may collect certain information such as:",
            },
            {
              type: "list",
              items: [
                "Advertising ID",
                "Device information",
                "General location derived from your IP address",
                "Advertisement interactions",
              ],
              after:
                "This information is handled according to Google's privacy practices and is used to deliver and measure advertisements.",
            },
          ],
        },
        {
          type: "subsection",
          id: "subscription-information",
          title: "G. Subscription Information",
          blocks: [
            {
              type: "p",
              text: "SpeedStar offers an optional premium subscription through Google Play Billing.",
            },
            {
              type: "p",
              text: "When you purchase a subscription, Google notifies SpeedStar that your subscription is active so that premium features can be enabled.",
            },
            {
              type: "p",
              text: "SpeedStar does not receive or store your payment card details, bank account information, or other payment credentials.",
            },
            {
              type: "p",
              text: "Subscription purchases are securely processed by Google through the Google Play Store.",
            },
          ],
        },
      ],
    },
    {
      id: "information-we-do-not-collect",
      title: "3. Information We Do NOT Collect",
      blocks: [
        {
          type: "p",
          text: "The current version of SpeedStar does not collect or require:",
        },
        {
          type: "list",
          items: [
            "Your name",
            "Email address",
            "Password",
            "Phone number",
            "Postal address",
            "Contacts",
            "Photos",
            "Videos",
            "Audio recordings",
            "SMS messages",
            "Call history",
            "Payment information",
            "Credit card information",
            "Government-issued identification",
            "Precise GPS location",
            "Credit card numbers",
            "Debit card numbers",
            "Bank account information",
            "Payment credentials",
          ],
          after: "You can use SpeedStar without creating a personal profile.",
        },
        {
          type: "p",
          text: "All subscription payments are securely processed by Google Play. SpeedStar does not process or store your payment information.",
        },
      ],
    },
    {
      id: "local-storage",
      title: "4. Local Storage",
      blocks: [
        {
          type: "p",
          text: "SpeedStar stores certain information locally on your device for your convenience.",
        },
        {
          type: "p",
          text: "This may include:",
        },
        {
          type: "list",
          items: [
            "Speed test history",
            "Data usage history",
            "Application preferences",
          ],
        },
        {
          type: "p",
          text: "This information:",
        },
        {
          type: "list",
          items: [
            "remains on your device",
            "is not uploaded to SpeedStar servers",
            "is not synchronized to cloud storage",
            "is not associated with a user account",
          ],
          after:
            "If you clear the application's storage or uninstall the application, this locally stored information will be permanently removed.",
        },
      ],
    },
    {
      id: "how-speedstar-performs-speed-tests",
      title: "5. How SpeedStar Performs Speed Tests",
      blocks: [
        {
          type: "p",
          text: "SpeedStar uses its own custom-built speed testing engine.",
        },
        {
          type: "p",
          text: "We do not use third-party speed test SDKs such as Ookla® or Fast.com®.",
        },
        {
          type: "p",
          text: "To perform internet performance measurements, SpeedStar currently communicates with testing infrastructure hosted by Cloudflare.",
        },
        {
          type: "p",
          text: "These connections are used only to measure:",
        },
        {
          type: "list",
          items: [
            "Download performance",
            "Upload performance",
            "Network latency",
          ],
        },
        {
          type: "p",
          text: "Cloudflare acts as the current network testing infrastructure and does not provide user accounts for SpeedStar.",
        },
        {
          type: "p",
          text: "The underlying testing infrastructure may change in future versions without affecting this Privacy Policy, provided the way your personal information is handled remains substantially the same.",
        },
      ],
    },
    {
      id: "third-party-services",
      title: "6. Third-Party Services",
      blocks: [
        {
          type: "p",
          text: "To operate SpeedStar, we currently use trusted third-party services, including:",
        },
        {
          type: "list",
          items: [
            "Google Play Services",
            "Firebase Analytics",
            "Firebase Crashlytics",
            "Google AdMob",
            "Cloudflare (network testing infrastructure)",
            "Google Play Billing",
          ],
        },
        {
          type: "p",
          text: "These providers may process certain technical information necessary to provide their respective services.",
        },
        {
          type: "p",
          text: "Their handling of information is governed by their own privacy policies.",
        },
      ],
    },
    {
      id: "how-we-use-information",
      title: "7. How We Use Information",
      blocks: [
        {
          type: "p",
          text: "We use collected information to:",
        },
        {
          type: "list",
          items: [
            "perform internet speed tests",
            "display accurate test results",
            "improve application performance",
            "diagnose crashes",
            "understand feature usage",
            "improve reliability",
            "maintain application security",
            "provide advertisements (where applicable)",
            "comply with legal obligations",
          ],
          after:
            "We do not use your information for automated profiling or decision-making.",
        },
      ],
    },
    {
      id: "subscription-purchases",
      title: "8. Subscription Purchases",
      blocks: [
        {
          type: "p",
          text: "SpeedStar offers an optional premium subscription through Google Play Billing.",
        },
        {
          type: "p",
          text: "Premium subscriptions may provide benefits including:",
        },
        {
          type: "list",
          items: [
            "Ad-free experience",
            "Premium features",
            "Additional benefits introduced in future updates",
          ],
        },
        {
          type: "p",
          text: "All purchases are securely processed by Google.",
        },
        {
          type: "p",
          text: "Subscription billing, renewals, cancellations, refunds, and payment management are handled by Google Play in accordance with Google's policies.",
        },
        {
          type: "p",
          text: "Users can manage or cancel their subscriptions at any time through the Google Play Store.",
        },
      ],
    },
    {
      id: "data-sharing",
      title: "9. Data Sharing",
      blocks: [
        {
          type: "p",
          text: "SpeedStar does not sell your personal information.",
        },
        {
          type: "p",
          text: "We do not share your locally stored speed test history with third parties.",
        },
        {
          type: "p",
          text: "Information may be shared only:",
        },
        {
          type: "list",
          items: [
            "with trusted service providers necessary to operate the application",
            "when required by law",
            "to protect the rights, safety, or security of SpeedStar, our users, or others",
          ],
        },
      ],
    },
    {
      id: "data-security",
      title: "10. Data Security",
      blocks: [
        {
          type: "p",
          text: "We take reasonable technical and organizational measures to protect information processed by SpeedStar.",
        },
        {
          type: "p",
          text: "These measures include:",
        },
        {
          type: "list",
          items: [
            "HTTPS encrypted communication",
            "Secure network connections",
            "Access controls",
            "Industry-standard security practices",
          ],
          after:
            "Although we strive to protect your information, no method of electronic transmission or storage can be guaranteed to be completely secure.",
        },
      ],
    },
    {
      id: "childrens-privacy",
      title: "11. Children's Privacy",
      blocks: [
        {
          type: "p",
          text: "SpeedStar is not directed toward children under the age of 13, or the minimum age required by applicable law in your jurisdiction.",
        },
        {
          type: "p",
          text: "We do not knowingly collect personal information from children.",
        },
        {
          type: "p",
          text: "If you believe a child has provided personal information to us, please contact us so that we can take appropriate action.",
        },
      ],
    },
    {
      id: "your-choices",
      title: "12. Your Choices",
      blocks: [
        {
          type: "p",
          text: "You remain in control of your locally stored information.",
        },
        {
          type: "p",
          text: "You may:",
        },
        {
          type: "list",
          items: [
            "clear your speed test history",
            "clear your data usage history",
            "clear application storage",
            "uninstall the application at any time",
          ],
          after:
            "Because SpeedStar currently does not provide user accounts, there is no cloud profile to delete.",
        },
      ],
    },
    {
      id: "changes-to-this-privacy-policy",
      title: "13. Changes to This Privacy Policy",
      blocks: [
        {
          type: "p",
          text: "We may update this Privacy Policy from time to time.",
        },
        {
          type: "p",
          text: "When material changes are made, we will update the Effected date shown at the top of this document.",
        },
        {
          type: "p",
          text: "Continued use of SpeedStar after changes become effective constitutes acceptance of the revised Privacy Policy.",
        },
      ],
    },
  ],
  contact: {
    title: "Contact",
    body: "If you have any questions about this Privacy Policy or our privacy practices, please contact us.",
    email: "contact@speedstar.xyz",
  },
}

export const termsDocument: LegalDocument = {
  eyebrow: "terms",
  title: "Terms of Service",
  meta: "Effective Date: August 5, 2026",
  description:
    "Terms governing your access to and use of the SpeedStar mobile application, website, and related services.",
  intro: [
    {
      type: "p",
      text: 'Welcome to SpeedStar ("SpeedStar", "we", "our", or "us").',
    },
    {
      type: "p",
      text: 'These Terms of Service ("Terms") govern your access to and use of the SpeedStar mobile application, website, and related services (collectively, the "Service").',
    },
    {
      type: "p",
      text: "By accessing or using SpeedStar, you agree to these Terms. If you do not agree, please do not use the Service.",
    },
  ],
  sections: [
    {
      id: "about-speedstar",
      title: "1. About SpeedStar",
      blocks: [
        {
          type: "p",
          text: "SpeedStar is an internet performance measurement platform designed to help users measure, monitor, and understand the performance of their internet connection.",
        },
        {
          type: "p",
          text: "Our services may include:",
        },
        {
          type: "list",
          items: [
            "Internet speed testing",
            "Latency measurement",
            "Network diagnostics",
            "Speed test history",
            "Data usage tracking",
            "Future features and services",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      blocks: [
        {
          type: "p",
          text: "You must comply with all applicable laws when using SpeedStar.",
        },
        {
          type: "p",
          text: "If you are under the age required by the laws of your country to use online services independently, you should use SpeedStar with the permission of a parent or legal guardian.",
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "3. Acceptable Use",
      blocks: [
        {
          type: "p",
          text: "You agree to use SpeedStar only for lawful purposes.",
        },
        {
          type: "p",
          text: "You must not:",
        },
        {
          type: "list",
          items: [
            "misuse or abuse the Service",
            "interfere with our infrastructure",
            "attempt unauthorized access",
            "reverse engineer or exploit the Service except where permitted by applicable law",
            "use automated tools to overload our systems",
            "use the Service for illegal activities",
            "distribute malware or harmful software through the Service",
          ],
        },
      ],
    },
    {
      id: "service-availability",
      title: "4. Service Availability",
      blocks: [
        {
          type: "p",
          text: "We aim to provide a reliable service, but we do not guarantee that SpeedStar will always be available or operate without interruption.",
        },
        {
          type: "p",
          text: "The Service may be temporarily unavailable due to:",
        },
        {
          type: "list",
          items: [
            "maintenance",
            "software updates",
            "technical issues",
            "internet outages",
            "third-party service disruptions",
          ],
        },
      ],
    },
    {
      id: "speed-test-accuracy",
      title: "5. Speed Test Accuracy",
      blocks: [
        {
          type: "p",
          text: "SpeedStar is designed to provide reliable internet performance measurements.",
        },
        {
          type: "p",
          text: "However, speed test results may vary depending on many factors, including:",
        },
        {
          type: "list",
          items: [
            "network congestion",
            "Wi-Fi quality",
            "device performance",
            "background applications",
            "ISP routing",
            "server availability",
            "hardware limitations",
          ],
          after:
            "For this reason, SpeedStar does not guarantee that speed test results are perfectly accurate or suitable for legal, regulatory, or contractual purposes.",
        },
      ],
    },
    {
      id: "local-data-storage",
      title: "6. Local Data Storage",
      blocks: [
        {
          type: "p",
          text: "The current version of SpeedStar stores speed test history and data usage information locally on your device.",
        },
        {
          type: "p",
          text: "This information is not synchronized with SpeedStar servers or associated with a user account.",
        },
        {
          type: "p",
          text: "You are responsible for managing and backing up any locally stored information if needed.",
        },
      ],
    },
    {
      id: "third-party-services",
      title: "7. Third-Party Services",
      blocks: [
        {
          type: "p",
          text: "SpeedStar relies on trusted third-party providers to support certain functionality.",
        },
        {
          type: "p",
          text: "These providers may include:",
        },
        {
          type: "list",
          items: [
            "Google Play Services",
            "Firebase Analytics",
            "Firebase Crashlytics",
            "Google AdMob",
            "Cloudflare (network testing infrastructure)",
          ],
          after:
            "Your use of these services may also be subject to the terms and privacy policies of those providers.",
        },
      ],
    },
    {
      id: "premium-subscription",
      title: "8. Premium Subscription",
      blocks: [
        {
          type: "p",
          text: "SpeedStar may offer an optional premium subscription through Google Play Billing.",
        },
        {
          type: "p",
          text: "An active subscription may provide:",
        },
        {
          type: "list",
          items: [
            "Removal of advertisements",
            "Access to premium features",
            "Future subscriber benefits",
          ],
        },
        {
          type: "p",
          text: "Subscriptions are optional.",
        },
        {
          type: "p",
          text: "Purchases, billing, renewals, cancellations, and refunds are managed entirely by Google Play.",
        },
        {
          type: "p",
          text: "Users can manage their subscriptions through their Google Play account.",
        },
      ],
    },
    {
      id: "open-source-software",
      title: "9. Open Source Software",
      blocks: [
        {
          type: "p",
          text: "SpeedStar may include or rely on open-source software components licensed under their respective open-source licenses.",
        },
        {
          type: "p",
          text: "Nothing in these Terms limits your rights under those licenses.",
        },
        {
          type: "p",
          text: "Information about applicable open-source licenses may be provided separately within the application or on our website.",
        },
      ],
    },
    {
      id: "disclaimer-of-warranties",
      title: "10. Disclaimer of Warranties",
      blocks: [
        {
          type: "p",
          text: 'SpeedStar is provided on an "AS IS" and "AS AVAILABLE" basis.',
        },
        {
          type: "p",
          text: "To the fullest extent permitted by law, we make no warranties regarding:",
        },
        {
          type: "list",
          items: [
            "uninterrupted availability",
            "accuracy of speed test results",
            "compatibility with all devices",
            "freedom from errors or bugs",
            "fitness for a particular purpose",
          ],
        },
      ],
    },
    {
      id: "limitation-of-liability",
      title: "11. Limitation of Liability",
      blocks: [
        {
          type: "p",
          text: "To the fullest extent permitted by applicable law, SpeedStar and its owners, employees, and affiliates shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from your use of the Service.",
        },
        {
          type: "p",
          text: "This includes, but is not limited to:",
        },
        {
          type: "list",
          items: [
            "loss of data",
            "loss of profits",
            "interruption of business",
            "network issues",
            "reliance on speed test results",
          ],
        },
      ],
    },
    {
      id: "indemnification",
      title: "12. Indemnification",
      blocks: [
        {
          type: "p",
          text: "You agree to indemnify and hold harmless SpeedStar from any claims, damages, liabilities, costs, or expenses arising from your misuse of the Service or violation of these Terms.",
        },
      ],
    },
    {
      id: "changes-to-the-service",
      title: "13. Changes to the Service",
      blocks: [
        {
          type: "p",
          text: "We may modify, improve, suspend, or discontinue any part of SpeedStar at any time without prior notice.",
        },
        {
          type: "p",
          text: "Future versions may introduce new features such as user accounts, cloud synchronization, subscriptions, or additional services.",
        },
      ],
    },
    {
      id: "changes-to-these-terms",
      title: "14. Changes to These Terms",
      blocks: [
        {
          type: "p",
          text: "We may update these Terms from time to time.",
        },
        {
          type: "p",
          text: "When material changes are made, we will update the Effected Date at the top of this document.",
        },
        {
          type: "p",
          text: "Continued use of SpeedStar after the updated Terms become effective constitutes acceptance of the revised Terms.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "15. Governing Law",
      blocks: [
        {
          type: "p",
          text: "These Terms shall be governed by and interpreted in accordance with the laws applicable to the jurisdiction in which SpeedStar operates, unless otherwise required by applicable consumer protection laws.",
        },
        {
          type: "p",
          text: "Nothing in these Terms limits any rights you may have under mandatory consumer protection laws in your country of residence.",
        },
      ],
    },
  ],
  contact: {
    title: "Contact",
    body: "If you have any questions about this Terms of Service or our privacy practices, please contact us.",
    email: "contact@speedstar.xyz",
  },
}
