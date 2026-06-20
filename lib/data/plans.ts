import type { Plan } from "@/lib/types";

/** Placeholder plan tiers — limits & prices are configurable by the platform owner. */
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    blurb: "Everything you need to take your first bookings online.",
    monthly: 0,
    yearly: 0,
    limits: { customers: "50", staffs: "1", services: "3", appointments: "30 / mo" },
    features: {
      gallery: false,
      payments: false,
      virtualMeeting: false,
      calendarSync: false,
      customDomain: false,
    },
  },
  {
    id: "standard",
    name: "Standard",
    blurb: "For growing teams that need staff portals and payments.",
    monthly: 35.5,
    yearly: 28.4,
    popular: true,
    limits: { customers: "200", staffs: "20", services: "20", appointments: "Unlimited" },
    features: {
      gallery: true,
      payments: true,
      virtualMeeting: true,
      calendarSync: false,
      customDomain: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    blurb: "Unlimited scale with calendar sync and your own domain.",
    monthly: 55.5,
    yearly: 44.4,
    limits: { customers: "Unlimited", staffs: "Unlimited", services: "200", appointments: "Unlimited" },
    features: {
      gallery: true,
      payments: true,
      virtualMeeting: true,
      calendarSync: true,
      customDomain: true,
    },
  },
];

export const PLAN_FEATURE_ROWS: { key: keyof Plan["features"]; label: string }[] = [
  { key: "gallery", label: "Gallery" },
  { key: "payments", label: "Get Online Payments" },
  { key: "virtualMeeting", label: "Virtual Meeting (Zoom / Google Meet)" },
  { key: "calendarSync", label: "Google Calendar Sync" },
  { key: "customDomain", label: "Custom domain" },
];
