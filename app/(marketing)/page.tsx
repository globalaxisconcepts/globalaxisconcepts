import Link from "next/link";
import {
  MonitorSmartphone,
  CalendarCheck,
  Users,
  CreditCard,
  LayoutTemplate,
  Share2,
  Video,
  Wallet,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingScene } from "@/components/illustrations/booking-scene";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: MonitorSmartphone,
    title: "Booking Website",
    text: "You get a ready-to-use booking site the moment you sign up.",
  },
  {
    icon: CalendarCheck,
    title: "Accept online bookings",
    text: "Accept bookings from your clients using your own booking site.",
  },
  {
    icon: Users,
    title: "Staff & Client Portal",
    text: "Your staff and clients get access to their own portal.",
  },
  {
    icon: CreditCard,
    title: "Accept Payments",
    text: "Accept online or offline payments from your clients.",
  },
];

const WORKFLOW = [
  { label: "website setup", text: "Customize your appointment schedule and booking page." },
  { label: "share link", text: "Share your personal booking page with your customers & prospects." },
  { label: "schedule", text: "Your customers & prospects book an available time with you." },
];

const ROWS = [
  {
    icon: LayoutTemplate,
    title: "Create your own booking page that brands your business",
    text: "Customise and brand your business to share your booking page with a smart URL — a smarter way to run your business.",
    label: "branded booking page",
  },
  {
    icon: Share2,
    title: "Accept bookings from anywhere, anytime",
    text: "There are no boundaries for your business. Share your booking page URL on any social platform, email, or anywhere to take bookings from around the world.",
    label: "share anywhere",
  },
  {
    icon: Video,
    title: "Connect with customers worldwide using video meetings",
    text: "Integrate with video conferencing so you can easily manage your virtual meetings and classes right from Global Axis Concepts.",
    label: "virtual meetings",
  },
  {
    icon: Wallet,
    title: "Accept Online / Offline payments from your customers",
    text: "Easily process your payments online in a secure manner. Choose from payment processors and offline options.",
    label: "payments",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Section A — Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="shell grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <Badge tone="brand" className="font-medium">
              <span className="size-1.5 rounded-full bg-brand" />
              One platform for any business
            </Badge>
            <h1 className="text-display mt-5 text-ink">
              Smart booking tool to grow your online business
            </h1>
            <p className="mt-5 max-w-xl text-[19px] leading-relaxed text-body">
              {BRAND.name} is appointment booking that helps you manage your
              business in a smart way — a branded booking site, payments, and
              staff tools out of the box.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register?trial=start" className={buttonVariants({ size: "lg" })}>
                Start 30 days trial
              </Link>
              <Link
                href="/pricing"
                className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
              >
                See pricing <ArrowRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {["No credit card", "Cancel anytime", "Setup in minutes"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            <BookingScene label="hero — booking scene" />
          </div>
        </div>
      </section>

      {/* ── Section B — Feature highlights ───────────────────────────── */}
      <section className="bg-canvas py-20 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2 text-ink">
              The best solution to start your online business with powerful
              features
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Card key={title} interactive className="p-6">
                <div className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink-800">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section C — Workflow ─────────────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Workflow</p>
            <h2 className="text-h2 mt-3 text-ink">
              Look at a glance how our system works
            </h2>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {WORKFLOW.map((step, i) => (
              <div key={step.label} className="text-center">
                <BookingScene label={step.label} badge={i + 1} seed={i + 1} />
                <p className="mx-auto mt-5 max-w-xs text-[15px] text-body">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section D — Alternating feature rows ─────────────────────── */}
      <section className="bg-canvas py-20 lg:py-24">
        <div className="shell space-y-20 lg:space-y-28">
          {ROWS.map(({ icon: Icon, title, text, label }, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={title}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <div className={cn(flip && "lg:order-2")}>
                  <div className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-ink">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-body">
                    {text}
                  </p>
                  <Link
                    href="/register?trial=start"
                    className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand transition-colors hover:text-brand-dark"
                  >
                    Learn more <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className={cn(flip && "lg:order-1")}>
                  <BookingScene label={label} seed={i} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section E — Closing CTA band ─────────────────────────────── */}
      <section className="py-20 lg:py-24">
        <div className="shell">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand to-brand-dark px-8 py-16 text-center shadow-card-hover sm:px-16">
            <div className="absolute -left-10 -top-10 size-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-0 size-64 rounded-full bg-white/10" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Start using {BRAND.name}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/85">
                Sign up for our 14-day trial with all features. No credit card
                required.
              </p>
              <Link
                href="/register?trial=start"
                className={cn(buttonVariants({ variant: "white", size: "lg" }), "mt-8")}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
