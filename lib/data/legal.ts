import type { LegalPage } from "@/lib/types";

/** Original placeholder legal copy — replace with reviewed legal text before launch. */
export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "terms-of-service",
    title: "Terms and Conditions",
    updated: "June 1, 2026",
    intro:
      "These Terms and Conditions govern your access to and use of Global Axis Concepts. By creating an account or using the platform, you agree to these terms.",
    sections: [
      {
        heading: "1. Using the platform",
        body: [
          "Global Axis Concepts provides software that lets businesses create booking pages, manage appointments, and accept payments from their customers. You are responsible for the accuracy of the information you publish and for complying with the laws that apply to your business.",
          "You must be at least 18 years old, or the age of majority in your jurisdiction, to create a business account.",
        ],
      },
      {
        heading: "2. Accounts and security",
        body: [
          "You are responsible for safeguarding your account credentials and for all activity that occurs under your account. Notify us promptly if you suspect any unauthorised use.",
          "We may suspend or terminate accounts that violate these terms, infringe the rights of others, or are used for unlawful activity.",
        ],
      },
      {
        heading: "3. Subscriptions and payments",
        body: [
          "Paid plans are billed in advance on a recurring basis. Trials convert to a paid plan only if you choose one; otherwise your account moves to the free plan at the end of the trial.",
          "Payments processed on behalf of your customers are handled by third-party payment processors and are subject to their terms.",
        ],
      },
      {
        heading: "4. Acceptable use",
        body: [
          "You agree not to misuse the platform, including by attempting to disrupt the service, access data that is not yours, or use it to send unsolicited or unlawful communications.",
        ],
      },
      {
        heading: "5. Changes to these terms",
        body: [
          "We may update these terms from time to time. We will post the revised version with an updated date, and significant changes will be communicated where appropriate.",
        ],
      },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    updated: "June 1, 2026",
    intro:
      "This Privacy Policy explains what information Global Axis Concepts collects, how we use it, and the choices you have. We aim to collect only what we need to provide the service.",
    sections: [
      {
        heading: "1. Information we collect",
        body: [
          "We collect account information you provide (such as your name, email, business details and phone number), booking and transaction data created through the platform, and technical information such as device and usage data.",
        ],
      },
      {
        heading: "2. How we use information",
        body: [
          "We use information to operate and improve the platform, process bookings and payments, send service-related communications such as reminders, and keep the service secure.",
        ],
      },
      {
        heading: "3. Sharing",
        body: [
          "We share information with service providers who help us run the platform (such as hosting and payment processors), and when required by law. We do not sell your personal information.",
        ],
      },
      {
        heading: "4. Data retention and your rights",
        body: [
          "We retain information for as long as your account is active or as needed to provide the service and meet legal obligations. Depending on your location, you may have rights to access, correct or delete your information.",
        ],
      },
      {
        heading: "5. Contact",
        body: [
          "If you have questions about this policy or your data, contact us through the Contact page and we will respond promptly.",
        ],
      },
    ],
  },
];

export const getLegalPage = (slug: string) =>
  LEGAL_PAGES.find((p) => p.slug === slug);
