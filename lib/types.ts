import type { BadgeProps } from "@/components/ui/badge";

export type BadgeTone = NonNullable<BadgeProps["tone"]>;

export interface Category {
  value: string;
  label: string;
  tone: BadgeTone;
}

export interface Company {
  slug: string;
  name: string;
  category: string; // matches Category.value
  country: string;
  tagline: string;
  /** Two-letter monogram for the placeholder avatar. */
  initials: string;
  /** Tailwind gradient classes for the avatar tile. */
  avatar: string;
}

export interface Plan {
  id: "free" | "standard" | "premium";
  name: string;
  blurb: string;
  monthly: number;
  yearly: number; // per month, billed yearly
  popular?: boolean;
  limits: {
    customers: string;
    staffs: string;
    services: string;
    appointments: string;
  };
  features: {
    gallery: boolean;
    payments: boolean;
    virtualMeeting: boolean;
    calendarSync: boolean;
    customDomain: boolean;
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  readMinutes: number;
  category: string;
  body: string[]; // paragraphs
  accent: string; // gradient classes for the cover
}

export interface Faq {
  question: string;
  answer: string;
}

export interface LegalPage {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}
