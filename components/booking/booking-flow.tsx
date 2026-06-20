"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2, Check, Clock, ArrowLeft, ArrowRight, Calendar, User, Users,
  CreditCard, Wallet, CheckCircle2, CalendarX,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea, Label, Field, FieldError } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/auth/auth-provider";
import { getCompany, type CompanyDoc } from "@/lib/firebase/content";
import { listServices, type Service } from "@/lib/firebase/company-data";
import {
  getStaff, getBookedTimes, createBooking, generateTimeSlots, type StaffMember,
} from "@/lib/firebase/booking";
import { cn } from "@/lib/utils";

const STEPS = ["Service", "Staff", "Date & time", "Details", "Payment", "Done"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function pad(n: number) { return String(n).padStart(2, "0"); }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function buildDates() {
  const out: { value: string; weekday: string; day: string; month: string }[] = [];
  const d = new Date();
  for (let i = 0; out.length < 14 && i < 30; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (day.getDay() === 0) continue; // closed Sundays
    out.push({
      value: `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`,
      weekday: day.toLocaleDateString("en-US", { weekday: "short" }),
      day: String(day.getDate()),
      month: day.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return out;
}
function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${ampm}`;
}

export function BookingFlow({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [company, setCompany] = React.useState<CompanyDoc | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);

  const [step, setStep] = React.useState(1);
  const [serviceId, setServiceId] = React.useState<string | null>(null);
  const [staffPick, setStaffPick] = React.useState<{ id: string | null; name: string }>({ id: null, name: "Any available" });
  const [date, setDate] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = React.useState(false);
  const [customer, setCustomer] = React.useState({ name: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [payment, setPayment] = React.useState<"offline" | "online">("offline");
  const [submitting, setSubmitting] = React.useState(false);
  const [flowError, setFlowError] = React.useState<string | null>(null);

  const dates = React.useMemo(buildDates, []);

  // load company + services + staff
  React.useEffect(() => {
    let active = true;
    Promise.all([getCompany(slug), listServices(slug).catch(() => []), getStaff(slug)])
      .then(([c, s, st]) => {
        if (!active) return;
        setCompany(c);
        setServices(s);
        setStaff(st);
        const pre = searchParams.get("service");
        if (pre && s.some((x) => x.id === pre)) setServiceId(pre);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug, searchParams]);

  // prefill customer from signed-in user
  React.useEffect(() => {
    if (user) setCustomer((c) => ({ ...c, email: c.email || user.email || "", name: c.name || user.displayName || "" }));
  }, [user]);

  const service = services.find((s) => s.id === serviceId) ?? null;

  // Only offer staff who can perform the chosen service (empty list = does everything).
  const eligibleStaff = React.useMemo(
    () =>
      staff.filter(
        (st) => st.assignedServiceIds.length === 0 || (serviceId != null && st.assignedServiceIds.includes(serviceId)),
      ),
    [staff, serviceId],
  );

  // If the picked member can't do the selected service, fall back to "Any available".
  React.useEffect(() => {
    if (staffPick.id && !eligibleStaff.some((st) => st.id === staffPick.id)) {
      setStaffPick({ id: null, name: "Any available" });
    }
  }, [eligibleStaff, staffPick.id]);

  // load booked times when date changes
  React.useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    getBookedTimes(slug, date)
      .then(setBooked)
      .finally(() => setSlotsLoading(false));
  }, [date, slug]);

  const availableSlots = React.useMemo(() => {
    if (!service || !date) return [];
    const isToday = date === todayStr();
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return generateTimeSlots(service.duration).filter((t) => {
      if (booked.includes(t)) return false;
      if (isToday) {
        const [h, m] = t.split(":").map(Number);
        if (h * 60 + m <= nowMin) return false;
      }
      return true;
    });
  }, [service, date, booked]);

  if (loading) {
    return <div className="flex justify-center py-32 text-muted"><Loader2 className="size-7 animate-spin" /></div>;
  }
  if (!company) {
    return (
      <div className="shell py-20">
        <EmptyState title="Company not found" description="This booking page doesn't exist." action={<Link href="/companies" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>Browse companies</Link>} />
      </div>
    );
  }

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!customer.name.trim()) e.name = "Enter your name.";
    if (!EMAIL_RE.test(customer.email)) e.email = "Enter a valid email.";
    if (!customer.phone.trim()) e.phone = "Enter a phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 4 && !validateDetails()) return;
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const canNext =
    (step === 1 && !!serviceId) ||
    (step === 2) ||
    (step === 3 && !!date && !!time) ||
    (step === 4) ||
    (step === 5);

  const confirm = async () => {
    if (!service || !date || !time) return;
    setSubmitting(true);
    setFlowError(null);
    try {
      await createBooking(slug, {
        serviceId: service.id, serviceName: service.name, duration: service.duration, price: service.price,
        staffId: staffPick.id, staffName: staffPick.name,
        date, time,
        customerName: customer.name.trim(), customerEmail: customer.email.trim(),
        customerPhone: customer.phone.trim(), notes: customer.notes.trim(),
        payment,
        customerUid: user?.uid ?? null,
        companyName: company.name,
      });
      setStep(6);
    } catch {
      // Most likely the slot was just taken (create-if-absent rule).
      setFlowError("That time was just booked by someone else. Please pick another slot.");
      setBooked((b) => [...b, time]);
      setTime(null);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shell max-w-3xl py-10 lg:py-14">
      {step < 6 && (
        <div className="mb-8">
          <Link href={`/${slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand">
            <ArrowLeft className="size-4" /> {company.name}
          </Link>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">Book an appointment</h1>
          {/* progress */}
          <ol className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
            {STEPS.slice(0, 5).map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span className={cn("grid size-6 place-items-center rounded-full text-xs font-bold",
                    done ? "bg-success text-white" : active ? "bg-brand text-white" : "bg-canvas-2 text-muted")}>
                    {done ? <Check className="size-3.5" /> : n}
                  </span>
                  <span className={cn("text-sm", active ? "font-semibold text-ink-800" : "text-muted")}>{label}</span>
                  {n < 5 && <span className="mx-1 hidden h-px w-5 bg-line sm:block" />}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {flowError && (
        <div className="mb-5 rounded-btn border border-danger/30 bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
          {flowError}
        </div>
      )}

      <div className="rounded-card border border-line-soft bg-surface p-6 shadow-xs sm:p-8">
        {/* STEP 1 — service */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Choose a service</h2>
            {services.length === 0 ? (
              <p className="mt-4 text-body">This business hasn&apos;t published any services yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={cn("flex w-full items-center justify-between gap-4 rounded-card border p-4 text-left transition-colors",
                      serviceId === s.id ? "border-brand bg-brand-tint/50" : "border-line hover:border-brand/40")}
                  >
                    <div>
                      <p className="font-display font-semibold text-ink-800">{s.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted"><Clock className="size-3.5" /> {s.duration} min · ${s.price.toFixed(2)}</p>
                    </div>
                    <span className={cn("grid size-5 place-items-center rounded-full border", serviceId === s.id ? "border-brand bg-brand text-white" : "border-line")}>
                      {serviceId === s.id && <Check className="size-3" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — staff */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Choose a team member</h2>
            <div className="mt-4 space-y-3">
              {[{ id: null, name: "Any available" }, ...eligibleStaff].map((st) => {
                const selected = staffPick.id === st.id;
                return (
                  <button
                    key={st.id ?? "any"}
                    onClick={() => setStaffPick(st)}
                    className={cn("flex w-full items-center gap-3 rounded-card border p-4 text-left transition-colors",
                      selected ? "border-brand bg-brand-tint/50" : "border-line hover:border-brand/40")}
                  >
                    <span className="grid size-9 place-items-center rounded-full bg-brand-tint text-brand">
                      {st.id ? <User className="size-4" /> : <Users className="size-4" />}
                    </span>
                    <span className="font-medium text-ink-800">{st.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 — date & time */}
        {step === 3 && (
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Pick a date & time</h2>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setDate(d.value); setTime(null); }}
                  className={cn("flex w-16 shrink-0 flex-col items-center rounded-card border py-3 transition-colors",
                    date === d.value ? "border-brand bg-brand text-white" : "border-line text-ink-800 hover:border-brand/40")}
                >
                  <span className={cn("text-xs", date === d.value ? "text-white/80" : "text-muted")}>{d.weekday}</span>
                  <span className="font-display text-lg font-bold">{d.day}</span>
                  <span className={cn("text-xs", date === d.value ? "text-white/80" : "text-muted")}>{d.month}</span>
                </button>
              ))}
            </div>

            {!date ? (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted"><Calendar className="size-4" /> Select a date to see available times.</p>
            ) : slotsLoading ? (
              <div className="mt-6 flex justify-center py-8 text-muted"><Loader2 className="size-5 animate-spin" /></div>
            ) : availableSlots.length === 0 ? (
              <div className="mt-6">
                <EmptyState icon={<CalendarX className="size-6" />} title="No slots available" description="There are no open times on this day. Please try another date." />
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availableSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={cn("rounded-btn border px-3 py-2.5 text-sm font-medium transition-colors",
                      time === t ? "border-brand bg-brand text-white" : "border-line text-ink-800 hover:border-brand/40")}
                  >
                    {fmtTime(t)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — details */}
        {step === 4 && (
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Your details</h2>
            {!user && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-btn bg-canvas-2 px-4 py-3 text-sm text-body">
                Have an account?
                <Link href={`/login?redirect=/${slug}/book`} className="font-semibold text-brand hover:text-brand-dark">Sign in</Link>
                <span className="text-muted">— or just continue as a guest below.</span>
              </div>
            )}
            <div className="mt-4 space-y-4">
              <Field>
                <Label htmlFor="bk-name" required>Full name</Label>
                <Input id="bk-name" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} invalid={!!errors.name} placeholder="Jane Cooper" />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="bk-email" required>Email</Label>
                  <Input id="bk-email" type="email" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} invalid={!!errors.email} placeholder="you@email.com" />
                  <FieldError>{errors.email}</FieldError>
                </Field>
                <Field>
                  <Label htmlFor="bk-phone" required>Phone</Label>
                  <Input id="bk-phone" type="tel" value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} invalid={!!errors.phone} placeholder="+1 555 000 0000" />
                  <FieldError>{errors.phone}</FieldError>
                </Field>
              </div>
              <Field>
                <Label htmlFor="bk-notes">Notes (optional)</Label>
                <Textarea id="bk-notes" rows={3} value={customer.notes} onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))} placeholder="Anything the business should know" />
              </Field>
            </div>
          </div>
        )}

        {/* STEP 5 — payment */}
        {step === 5 && (
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Payment</h2>
            <div className="mt-4 space-y-3">
              <button
                onClick={() => setPayment("offline")}
                className={cn("flex w-full items-center gap-3 rounded-card border p-4 text-left transition-colors",
                  payment === "offline" ? "border-brand bg-brand-tint/50" : "border-line hover:border-brand/40")}
              >
                <Wallet className="size-5 text-brand" />
                <div className="flex-1">
                  <p className="font-semibold text-ink-800">Pay at the appointment</p>
                  <p className="text-sm text-muted">Settle in person when you arrive.</p>
                </div>
                <span className={cn("grid size-5 place-items-center rounded-full border", payment === "offline" ? "border-brand bg-brand text-white" : "border-line")}>
                  {payment === "offline" && <Check className="size-3" />}
                </span>
              </button>
              <div className="flex w-full items-center gap-3 rounded-card border border-line bg-canvas px-4 py-4 text-left opacity-70">
                <CreditCard className="size-5 text-muted" />
                <div className="flex-1">
                  <p className="font-semibold text-ink-800">Pay online</p>
                  <p className="text-sm text-muted">Card payments arrive with the Stripe integration.</p>
                </div>
                <span className="rounded-pill bg-canvas-2 px-2.5 py-1 text-xs font-semibold text-muted">Soon</span>
              </div>
            </div>

            {/* summary */}
            <div className="mt-6 rounded-card bg-canvas p-4 text-sm">
              <p className="font-display font-semibold text-ink-800">Summary</p>
              <dl className="mt-2 space-y-1.5 text-body">
                <div className="flex justify-between"><dt className="text-muted">Service</dt><dd className="font-medium text-ink-800">{service?.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">With</dt><dd className="font-medium text-ink-800">{staffPick.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">When</dt><dd className="font-medium text-ink-800">{date} · {time && fmtTime(time)}</dd></div>
                <div className="flex justify-between border-t border-line-soft pt-1.5"><dt className="text-muted">Total</dt><dd className="font-bold text-brand">${service?.price.toFixed(2)}</dd></div>
              </dl>
            </div>
          </div>
        )}

        {/* STEP 6 — confirmation */}
        {step === 6 && service && (
          <div className="py-6 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-success-tint text-success">
              <CheckCircle2 className="size-9" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-ink">Booking confirmed!</h2>
            <p className="mt-2 text-body">
              Your {service.name} with {company.name} is booked for{" "}
              <strong>{date} at {time && fmtTime(time)}</strong>.
            </p>
            <div className="mx-auto mt-6 max-w-sm rounded-card bg-canvas p-4 text-left text-sm">
              <dl className="space-y-1.5 text-body">
                <div className="flex justify-between"><dt className="text-muted">Service</dt><dd className="font-medium text-ink-800">{service.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">With</dt><dd className="font-medium text-ink-800">{staffPick.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Name</dt><dd className="font-medium text-ink-800">{customer.name}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Payment</dt><dd className="font-medium text-ink-800">Pay at appointment</dd></div>
              </dl>
            </div>
            <p className="mt-4 text-xs text-muted">A confirmation will be sent once email notifications are enabled.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={`/${slug}`} className={cn(buttonVariants({ variant: "secondary" }))}>Back to {company.name}</Link>
              <Link href="/" className={buttonVariants()}>Done</Link>
            </div>
          </div>
        )}

        {/* nav */}
        {step < 6 && (
          <div className="mt-8 flex items-center justify-between border-t border-line-soft pt-5">
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            {step < 5 ? (
              <Button onClick={next} disabled={!canNext}>Continue <ArrowRight className="size-4" /></Button>
            ) : (
              <Button onClick={confirm} loading={submitting}>Confirm booking</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
