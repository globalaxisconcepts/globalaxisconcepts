import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Global Axis Concepts team. We're here to help you get set up.",
};

const DETAILS = [
  { icon: Mail, label: "Email", value: "hello@globalaxisconcepts.com" },
  { icon: Phone, label: "Phone", value: "+1 (555) 014-2200" },
  { icon: MapPin, label: "Address", value: "100 Market Street, Suite 400" },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 9am – 6pm" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get In Touch"
        subtitle="Have a question or want a hand getting started? Send us a message and we'll get back to you."
      />
      <section className="shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="rounded-card border border-line-soft bg-surface p-7 shadow-xs sm:p-9">
            <ContactForm />
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Talk to our team
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-body">
              Prefer to reach us directly? Use any of the details below — we read
              every message.
            </p>
            <ul className="mt-7 space-y-5">
              {DETAILS.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {label}
                    </p>
                    <p className="mt-0.5 text-[15px] font-medium text-ink-800">
                      {value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
