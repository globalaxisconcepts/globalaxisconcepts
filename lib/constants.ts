export const BRAND = {
  name: "Global Axis Concepts",
  short: "Global Axis",
  tagline: "Smart booking tool to grow your online business",
  descriptor:
    "Global Axis Concepts is a complete SaaS based multi business service booking software, that gives your users the ability to create and manage bookings, staffs, services, customers, etc.",
} as const;

export const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Companies", href: "/companies" },
  { label: "Blogs", href: "/blogs" },
  { label: "FAQs", href: "/faqs" },
  { label: "Contact", href: "/contact" },
] as const;

export const PAGES_DROPDOWN = [
  { label: "Terms and Conditions", href: "/page/terms-of-service" },
  { label: "Privacy Policy", href: "/page/privacy-policy" },
] as const;

export const LANGUAGES = [{ code: "en", label: "English" }] as const;

// Platform owner(s) with super-admin access. Must mirror isSuperAdmin() in firestore.rules.
export const SUPER_ADMIN_EMAILS = ["globalaxisconcepts@gmail.com"];

export const FOOTER_COLUMNS = [
  {
    title: "Services",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Blogs", href: "/blogs" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Pages",
    links: [
      { label: "Terms and Conditions", href: "/page/terms-of-service" },
      { label: "Privacy Policy", href: "/page/privacy-policy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Companies", href: "/companies" },
      { label: "Home", href: "/" },
    ],
  },
] as const;

export const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
  { label: "Twitter / X", href: "https://x.com", icon: "x" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
] as const;

/** Reserved root segments that cannot be used as a tenant company slug. */
export const RESERVED_SLUGS = new Set([
  "pricing", "companies", "blogs", "faqs", "contact", "page", "login",
  "register", "forgot-password", "reset-password", "dashboard", "staff",
  "account", "admin", "api", "design-system", "_next", "favicon.ico",
]);
