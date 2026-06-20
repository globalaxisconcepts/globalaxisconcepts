"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Check, X, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, Field, FieldError } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { signUpEmail, signInGoogle, authErrorMessage } from "@/lib/firebase/auth";
import { isSlugAvailable, createCompany } from "@/lib/firebase/db";
import { homePathForUser } from "@/lib/auth-routing";
import { CATEGORIES } from "@/lib/data/categories";
import { PLANS } from "@/lib/data/plans";
import { RESERVED_SLUGS } from "@/lib/constants";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9-]+$/;

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const planId = searchParams.get("plan");
  const billing = searchParams.get("billing") ?? "monthly";
  const trial = searchParams.get("trial") === "start";
  const plan = PLANS.find((p) => p.id === planId);

  const [values, setValues] = React.useState({
    slug: "", name: "", category: "", details: "", email: "", phone: "", password: "",
  });
  const [terms, setTerms] = React.useState(false);
  const [slugStatus, setSlugStatus] = React.useState<SlugStatus>("idle");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  // Signed in AND already has a profile → nothing to register; go to their home.
  React.useEffect(() => {
    if (!authLoading && user && profile) router.replace(homePathForUser(profile, user.email));
  }, [authLoading, user, profile, router]);

  // "complete" mode = authed (e.g. via Google) but no company yet → only collect company info.
  const completeMode = !!user;

  // Live slug availability (format → reserved → Firestore), debounced.
  React.useEffect(() => {
    const slug = values.slug;
    if (!slug) return setSlugStatus("idle");
    if (!SLUG_RE.test(slug)) return setSlugStatus("invalid");
    if (RESERVED_SLUGS.has(slug)) return setSlugStatus("taken");
    setSlugStatus("checking");
    let active = true;
    const t = setTimeout(async () => {
      try {
        const ok = await isSlugAvailable(slug);
        if (active) setSlugStatus(ok ? "available" : "taken");
      } catch {
        if (active) setSlugStatus("available"); // create-once rule is the source of truth
      }
    }, 450);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [values.slug]);

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const baseValid =
    slugStatus === "available" &&
    terms &&
    values.name.trim() !== "" &&
    values.category !== "" &&
    values.phone.trim() !== "";
  const canSubmit = completeMode
    ? baseValid
    : baseValid && EMAIL_RE.test(values.email) && values.password.length >= 8;

  const onGoogle = async () => {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInGoogle();
      // user is now set; form switches to "complete" mode to collect company details.
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      setFormError(authErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const err: Record<string, string> = {};
    if (slugStatus !== "available") err.slug = "Choose an available company URL.";
    if (!values.name.trim()) err.name = "Enter your company name.";
    if (!values.category) err.category = "Select a category.";
    if (!values.phone.trim()) err.phone = "Enter a phone number.";
    if (!completeMode && !EMAIL_RE.test(values.email)) err.email = "Enter a valid email address.";
    if (!completeMode && values.password.length < 8) err.password = "Use at least 8 characters.";
    if (!terms) err.terms = "You must accept the terms to continue.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      let uid: string;
      let ownerEmail: string | null;
      if (completeMode && user) {
        uid = user.uid;
        ownerEmail = user.email;
      } else {
        const cred = await signUpEmail(values.email, values.password);
        uid = cred.user.uid;
        ownerEmail = cred.user.email;
      }

      await createCompany({
        slug: values.slug,
        name: values.name,
        category: values.category,
        details: values.details,
        ownerUid: uid,
        ownerEmail,
        plan: plan?.id ?? "free",
      });

      toast({
        tone: "success",
        title: "Company registered",
        description: "Your account and booking page are ready.",
      });
      router.replace("/dashboard");
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      if (code === "permission-denied") {
        setSlugStatus("taken");
        setFormError("That company URL was just taken — please choose another.");
      } else {
        setFormError(authErrorMessage(code));
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && profile)) {
    return (
      <div className="flex justify-center py-10 text-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Register your company</h1>
      <p className="mt-1.5 text-[15px] text-body">
        Basic information — you can add more later.
      </p>

      {(plan || trial) && (
        <div className="mt-5 flex items-center gap-3 rounded-card border border-brand/25 bg-brand-tint px-4 py-3">
          <Sparkles className="size-5 shrink-0 text-brand" />
          <p className="text-sm text-ink-800">
            {plan ? (
              <>Selected plan: <strong>{plan.name}</strong> <span className="text-body">({billing})</span></>
            ) : (
              <>Starting your <strong>14-day free trial</strong> — all features, no credit card.</>
            )}
          </p>
        </div>
      )}

      {completeMode ? (
        <div className="mt-5 flex items-center gap-2.5 rounded-card border border-success/25 bg-success-tint px-4 py-3 text-sm text-ink-800">
          <Check className="size-4 shrink-0 text-success" />
          Signed in as <strong>{user?.email}</strong> — finish your company details below.
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-btn border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-800 transition-colors hover:bg-canvas-2 disabled:opacity-60"
          >
            <GoogleIcon className="size-5" />
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      {formError && (
        <div className="mb-4 rounded-btn border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-[13px] font-medium text-danger">
          {formError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {/* slug */}
        <Field>
          <Label htmlFor="slug" required>Company URL</Label>
          <div
            className={`flex items-stretch overflow-hidden rounded-sm border ${
              slugStatus === "invalid" || slugStatus === "taken"
                ? "border-danger"
                : slugStatus === "available"
                  ? "border-success"
                  : "border-line"
            } focus-within:shadow-ring`}
          >
            <span className="flex items-center bg-canvas-2 px-3 font-mono text-sm text-muted">
              globalaxisconcepts.com/
            </span>
            <input
              id="slug"
              name="slug"
              autoComplete="off"
              value={values.slug}
              onChange={set("slug")}
              placeholder="your-company"
              className="flex-1 bg-white px-3 py-3 text-[15px] text-ink-800 placeholder:text-muted focus:outline-none"
            />
            <span className="flex items-center pr-3">
              {slugStatus === "checking" && <Loader2 className="size-4 animate-spin text-muted" />}
              {slugStatus === "available" && <Check className="size-4 text-success" />}
              {(slugStatus === "taken" || slugStatus === "invalid") && <X className="size-4 text-danger" />}
            </span>
          </div>
          {slugStatus === "invalid" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-danger">
              <AlertCircle className="size-3.5" /> URL contains illegal characters — use lowercase letters, numbers and hyphens.
            </p>
          )}
          {slugStatus === "taken" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-danger">
              <AlertCircle className="size-3.5" /> This name is already taken, try another one.
            </p>
          )}
          {slugStatus === "available" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-success">
              <Check className="size-3.5" /> Name is available.
            </p>
          )}
          {slugStatus !== "invalid" && slugStatus !== "taken" && slugStatus !== "available" && (
            <p className="mt-1.5 text-[13px] text-muted">
              Related to your booking page URL & cannot be changed later.
            </p>
          )}
        </Field>

        <Field>
          <Label htmlFor="name" required>Company name</Label>
          <Input id="name" name="name" autoComplete="organization" value={values.name} onChange={set("name")} invalid={!!errors.name} placeholder="Glow Studio" />
          <FieldError>{errors.name}</FieldError>
        </Field>

        <Field>
          <Label htmlFor="category" required>Category</Label>
          <Select id="category" value={values.category} onChange={set("category")} invalid={!!errors.category}>
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <FieldError>{errors.category}</FieldError>
        </Field>

        <Field>
          <Label htmlFor="details">Company details</Label>
          <Textarea id="details" value={values.details} onChange={set("details")} placeholder="A short description of your business (optional)" rows={3} />
        </Field>

        {!completeMode && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <Label htmlFor="email" required>Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} invalid={!!errors.email} placeholder="you@business.com" />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field>
              <Label htmlFor="phone" required>Phone</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} invalid={!!errors.phone} placeholder="+1 555 000 0000" />
              <FieldError>{errors.phone}</FieldError>
            </Field>
          </div>
        )}

        {completeMode && (
          <Field>
            <Label htmlFor="phone" required>Phone</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} invalid={!!errors.phone} placeholder="+1 555 000 0000" />
            <FieldError>{errors.phone}</FieldError>
          </Field>
        )}

        {!completeMode && (
          <Field>
            <Label htmlFor="password" required>Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={set("password")} invalid={!!errors.password} placeholder="At least 8 characters" />
            <FieldError>{errors.password}</FieldError>
          </Field>
        )}

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-body">
            <input type="checkbox" id="terms" name="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-4 shrink-0 rounded border-line accent-brand" />
            <span>
              I have read and understood the{" "}
              <Link href="/page/terms-of-service" className="font-semibold text-brand hover:underline">Terms and Conditions</Link>{" "}
              and{" "}
              <Link href="/page/privacy-policy" className="font-semibold text-brand hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          <FieldError>{errors.terms}</FieldError>
        </div>

        <Button type="submit" loading={loading} disabled={!canSubmit} className="w-full">
          {loading ? "Creating account…" : "Register"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">Sign In</Link>
      </p>
    </div>
  );
}
