"use client";

import * as React from "react";
import { Search, Sparkles, Inbox, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle, CardText } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select, Label, FieldError, FieldHint, Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { BookingScene } from "@/components/illustrations/booking-scene";

const SWATCHES: { name: string; className: string; hex: string }[] = [
  { name: "brand", className: "bg-brand", hex: "#286efb" },
  { name: "brand-dark", className: "bg-brand-dark", hex: "#1b5ce0" },
  { name: "brand-tint", className: "bg-brand-tint border border-line", hex: "#eaf1ff" },
  { name: "ink", className: "bg-ink", hex: "#0f1729" },
  { name: "body", className: "bg-body", hex: "#5b6472" },
  { name: "muted", className: "bg-muted", hex: "#9aa3b2" },
  { name: "canvas", className: "bg-canvas border border-line", hex: "#f7f9fc" },
  { name: "success", className: "bg-success", hex: "#1f9d57" },
  { name: "warning", className: "bg-warning", hex: "#c77700" },
  { name: "danger", className: "bg-danger", hex: "#e0395e" },
  { name: "accent-purple", className: "bg-accent-purple", hex: "#7c5cfc" },
  { name: "accent-teal", className: "bg-accent-teal", hex: "#0fa3a3" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 font-display text-xl font-bold text-ink">{children}</h2>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line-soft py-12 first:border-t-0">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [yearly, setYearly] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  return (
    <div className="shell py-14">
      <header className="mb-4">
        <p className="eyebrow">Design System</p>
        <h1 className="text-h2 mt-2 text-ink">Global Axis Concepts UI Kit</h1>
        <p className="mt-3 max-w-2xl text-[17px] text-body">
          The living style sheet — tokens and components extracted from the
          prototype. Primary <code className="font-mono text-brand">#286efb</code>,
          headings in Poppins, body in DM Sans, eyebrows in JetBrains Mono.
        </p>
      </header>

      <Block title="Colors">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.name}>
              <div className={`h-16 w-full rounded-card ${s.className}`} />
              <p className="mt-2 text-sm font-medium text-ink-800">{s.name}</p>
              <p className="font-mono text-xs text-muted">{s.hex}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Typography">
        <div className="space-y-4">
          <p className="eyebrow">Eyebrow · JetBrains Mono</p>
          <p className="text-display text-ink">Display heading — Poppins 700</p>
          <p className="text-h2 text-ink">Section heading H2</p>
          <h3 className="font-display text-xl font-semibold text-ink-800">
            Card / subsection title
          </h3>
          <p className="max-w-2xl text-[19px] leading-relaxed text-body">
            Body text uses DM Sans at 19px with 1.6 line-height for comfortable
            reading. The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-sm text-muted">Muted caption / helper text.</p>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link button</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">
            Large <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="mt-6 w-fit rounded-card bg-gradient-to-br from-brand to-brand-dark p-6">
          <Button variant="white">White on blue band</Button>
        </div>
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap gap-2.5">
          <Badge tone="brand">Brand</Badge>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="success">Confirmed</Badge>
          <Badge tone="warning">Pending</Badge>
          <Badge tone="danger">Cancelled</Badge>
          <Badge tone="purple">Beauty</Badge>
          <Badge tone="teal">Medical</Badge>
          <Badge tone="orange">Sport &amp; Gym</Badge>
        </div>
      </Block>

      <Block title="Form fields">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <Field>
            <Label htmlFor="ds-name" required>
              Full name
            </Label>
            <Input id="ds-name" placeholder="Jane Cooper" />
            <FieldHint>This appears on your booking page.</FieldHint>
          </Field>
          <Field>
            <Label htmlFor="ds-email" required>
              Email
            </Label>
            <Input
              id="ds-email"
              type="email"
              placeholder="you@business.com"
              invalid={showError}
              defaultValue={showError ? "not-an-email" : ""}
            />
            {showError && <FieldError>Enter a valid email address.</FieldError>}
          </Field>
          <Field>
            <Label htmlFor="ds-cat">Category</Label>
            <Select id="ds-cat" defaultValue="">
              <option value="" disabled>
                Select a category
              </option>
              <option>Beauty and wellness</option>
              <option>Medical</option>
              <option>Law &amp; Consultancy</option>
            </Select>
          </Field>
          <Field>
            <Label htmlFor="ds-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input id="ds-search" className="pl-10" placeholder="Search companies…" />
            </div>
          </Field>
          <Field className="sm:col-span-2">
            <Label htmlFor="ds-msg">Message</Label>
            <Textarea id="ds-msg" placeholder="Tell us how we can help…" />
          </Field>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => setShowError((v) => !v)}
        >
          Toggle error state
        </Button>
      </Block>

      <Block title="Switch & toggles">
        <div className="flex items-center gap-3">
          <span className={!yearly ? "font-semibold text-ink-800" : "text-muted"}>
            Monthly
          </span>
          <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Billing period" />
          <span className={yearly ? "font-semibold text-ink-800" : "text-muted"}>
            Yearly
          </span>
          <Badge tone="success" size="sm">
            Save 20%
          </Badge>
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card interactive>
            <CardBody>
              <Badge tone="purple" size="sm">
                Beauty and wellness
              </Badge>
              <CardTitle className="mt-3">Glow Studio</CardTitle>
              <CardText className="mt-1.5">
                Interactive card — hover to see the lift and elevated shadow.
              </CardText>
              <Button variant="secondary" size="sm" className="mt-4 w-full">
                View Page
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="grid size-12 place-items-center rounded-xl bg-brand-tint text-brand">
                <Sparkles className="size-6" />
              </div>
              <CardTitle className="mt-4">Static feature card</CardTitle>
              <CardText className="mt-1.5">
                Soft blue-tinted shadow with a subtle border.
              </CardText>
            </CardBody>
          </Card>
          <div className="overflow-hidden rounded-card border border-line-soft bg-surface p-4">
            <BookingScene label="illustration" />
          </div>
        </div>
      </Block>

      <Block title="Accordion">
        <div className="max-w-2xl">
          <Accordion
            items={[
              {
                question: "How does the free trial work?",
                answer:
                  "The 14-day trial is 100% free, no credit card required. At the end you can upgrade or auto-downgrade to the free plan.",
              },
              {
                question: "Do I need to choose a plan now?",
                answer:
                  "No — enjoy the full unlimited version free for 14 days and choose a plan whenever you're ready.",
              },
            ]}
            defaultOpen={[0]}
          />
        </div>
      </Block>

      <Block title="Loading & empty states">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="No companies match these filters"
            description="Try adjusting your category or country selection to see more results."
            action={
              <Button variant="secondary" size="sm">
                Clear filters
              </Button>
            }
          />
        </div>
        <div className="mt-6 max-w-sm space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Block>

      <Block title="Toasts">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              toast({ tone: "success", title: "Booking confirmed", description: "We've emailed the details." })
            }
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({ tone: "error", title: "Payment failed", description: "Please try a different method." })
            }
          >
            Error toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ tone: "info", title: "Heads up", description: "Your trial ends in 3 days." })}
          >
            Info toast
          </Button>
        </div>
      </Block>
    </div>
  );
}
