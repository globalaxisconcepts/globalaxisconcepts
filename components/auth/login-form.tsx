"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Button } from "@/components/ui/button";
import { Input, Label, Field, FieldError } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { signInEmail, signInGoogle, authErrorMessage } from "@/lib/firebase/auth";
import { getUserProfile } from "@/lib/firebase/db";
import { homePathForUser } from "@/lib/auth-routing";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();

  const [values, setValues] = React.useState({ email: "", password: "" });
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  // Already signed in → leave the auth page (honor an explicit ?redirect, else
  // send the user to their role's home).
  React.useEffect(() => {
    if (!authLoading && user) router.replace(redirectParam ?? homePathForUser(profile, user.email));
  }, [authLoading, user, profile, redirectParam, router]);

  const routeAfterAuth = async (uid: string, email: string | null) => {
    if (redirectParam) return router.replace(redirectParam);
    const p = await getUserProfile(uid).catch(() => null);
    router.replace(homePathForUser(p, email));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const err: typeof errors = {};
    if (!EMAIL_RE.test(values.email)) err.email = "Enter a valid email address.";
    if (!values.password) err.password = "Enter your password.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const cred = await signInEmail(values.email, values.password);
      toast({ tone: "success", title: "Welcome back" });
      await routeAfterAuth(cred.user.uid, cred.user.email);
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      setFormError(authErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setFormError(null);
    setGoogleLoading(true);
    try {
      const cred = await signInGoogle();
      toast({ tone: "success", title: "Welcome back" });
      await routeAfterAuth(cred.user.uid, cred.user.email);
    } catch (e) {
      const code = e instanceof FirebaseError ? e.code : "";
      setFormError(authErrorMessage(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-[15px] text-body">
        Sign in to manage your bookings, staff, and services.
      </p>

      <button
        type="button"
        onClick={onGoogle}
        disabled={googleLoading}
        className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-btn border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-800 transition-colors hover:bg-canvas-2 disabled:opacity-60"
      >
        <GoogleIcon className="size-5" />
        {googleLoading ? "Connecting…" : "Continue with Google"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      {formError && (
        <div className="mb-4 rounded-btn border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-[13px] font-medium text-danger">
          {formError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            invalid={!!errors.email}
            placeholder="you@business.com"
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field>
          <Label htmlFor="password" required>Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            invalid={!!errors.password}
            placeholder="••••••••"
          />
          <FieldError>{errors.password}</FieldError>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
            <input type="checkbox" id="remember" name="remember" className="size-4 rounded border-line accent-brand" />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => toast({ tone: "info", title: "Password reset is coming soon" })}
            className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-body">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">
          Register
        </Link>
      </p>
    </div>
  );
}
