import type { BlogPost } from "@/lib/types";

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "reduce-no-shows-with-online-booking",
    title: "5 ways online booking reduces no-shows",
    excerpt:
      "No-shows quietly drain revenue from service businesses. Here's how a smart booking page and automated reminders win that time back.",
    date: "2026-05-28",
    author: "The Global Axis Team",
    readMinutes: 5,
    category: "Growth",
    accent: "from-brand to-brand-dark",
    body: [
      "Every empty slot from a no-show is revenue you can't get back. For appointment-led businesses, even a handful each week adds up to thousands lost over a year.",
      "The good news: most no-shows are preventable with the right system. Letting customers book, reschedule and cancel themselves removes the friction that causes people to simply not turn up.",
      "Automated email and SMS reminders are the single biggest lever. A reminder 24 hours and again 1 hour before the appointment keeps you top of mind without any manual effort from your team.",
      "Requiring a deposit or full payment at booking is the next step. When customers have skin in the game, attendance climbs sharply — and you can offer flexible cancellation windows to stay fair.",
      "Finally, make rescheduling effortless. A customer who can move their slot in two taps is far more valuable than one who ghosts because changing was too hard.",
    ],
  },
  {
    slug: "branded-booking-page-checklist",
    title: "The branded booking page checklist",
    excerpt:
      "Your booking page is often the first impression a customer gets. Use this checklist to make it look unmistakably yours.",
    date: "2026-05-14",
    author: "The Global Axis Team",
    readMinutes: 4,
    category: "Branding",
    accent: "from-accent-purple to-brand",
    body: [
      "A booking page is a storefront. When it looks generic, customers hesitate; when it looks like you, they trust it.",
      "Start with the essentials: your logo, brand colours and a short, confident description of what you do and who you help.",
      "Add proof. A gallery of your work, clear service descriptions with durations and prices, and a friendly tone do more than any sales copy.",
      "Make the path obvious. One prominent 'Book Now' action, services grouped logically, and as few steps as possible between interest and confirmation.",
    ],
  },
  {
    slug: "accept-payments-online-vs-offline",
    title: "Online vs offline payments: which should you offer?",
    excerpt:
      "Should you take payment up front, in person, or both? A practical guide to choosing a payment model for your service.",
    date: "2026-04-30",
    author: "The Global Axis Team",
    readMinutes: 6,
    category: "Payments",
    accent: "from-success to-accent-teal",
    body: [
      "How you collect payment shapes your cash flow, your no-show rate and your customer experience. There's no single right answer — but there are clear trade-offs.",
      "Online payments secure revenue before the appointment and cut admin. They pair naturally with deposits and are ideal for high-demand slots.",
      "Offline payments keep things flexible for walk-ins and trusted regulars, and avoid processing fees on smaller transactions.",
      "Most businesses land on a hybrid: deposits online to protect the slot, balance settled in person. Offer both and let the service dictate the default.",
    ],
  },
  {
    slug: "scheduling-staff-without-the-chaos",
    title: "Scheduling staff without the chaos",
    excerpt:
      "Working hours, breaks, buffer time and assigned services — here's how to keep a multi-staff calendar conflict-free.",
    date: "2026-04-12",
    author: "The Global Axis Team",
    readMinutes: 5,
    category: "Operations",
    accent: "from-accent-orange to-warning",
    body: [
      "Once you add a second team member, scheduling stops being a calendar and starts being a system. Availability has to account for who can do what, and when.",
      "Define each staff member's working hours and breaks first. Availability should always be derived from these — never hand-managed.",
      "Buffer time between appointments protects your team from back-to-back burnout and gives room for clean-up, notes and travel.",
      "Assign services to the staff qualified to deliver them, so customers only ever see slots that can actually be fulfilled.",
    ],
  },
  {
    slug: "virtual-meetings-for-service-businesses",
    title: "Going virtual: video meetings for service businesses",
    excerpt:
      "From consultations to classes, virtual appointments open your business to customers anywhere. Here's how to do it well.",
    date: "2026-03-25",
    author: "The Global Axis Team",
    readMinutes: 4,
    category: "Growth",
    accent: "from-brand to-accent-teal",
    body: [
      "Virtual appointments removed the last boundary for service businesses: location. A consultant in one city can now serve clients on another continent.",
      "Automatically generating a meeting link on confirmation removes the most common point of failure — the customer not knowing where to join.",
      "Treat virtual sessions with the same rigour as in-person ones: reminders, buffer time, and a clear cancellation policy still apply.",
      "Used well, virtual delivery doesn't replace your in-person work — it adds an entirely new, scalable revenue stream alongside it.",
    ],
  },
  {
    slug: "choosing-your-booking-software",
    title: "How to choose booking software you won't outgrow",
    excerpt:
      "The features that matter on day one are rarely the ones that matter at scale. A buyer's guide for the long game.",
    date: "2026-03-08",
    author: "The Global Axis Team",
    readMinutes: 7,
    category: "Guides",
    accent: "from-accent-teal to-brand",
    body: [
      "It's easy to pick booking software for today's needs and hit a wall in a year. The better question is: what will I need when I'm twice the size?",
      "Look for multi-staff support, flexible availability rules and payment options even if you don't need them yet — migrating later is painful.",
      "Branding and a custom domain matter more than they seem. Your booking page is part of your brand, not a third party's.",
      "Finally, weigh the ecosystem: integrations, portals for staff and customers, and a clear pricing path as you grow. The cheapest tool is rarely the one you keep.",
    ],
  },
];

export const getPost = (slug: string) =>
  BLOG_POSTS.find((p) => p.slug === slug);
