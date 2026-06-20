"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Loader2, CheckCircle2, AlertCircle, CalendarClock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, Field } from "@/components/ui/field";
import { useAuth } from "@/components/auth/auth-provider";
import {
  signInEmail,
  signUpEmail,
  signInGoogle,
  authErrorMessage,
} from "@/lib/firebase/auth";
import { getStaffMember, claimStaff, type StaffMember } from "@/lib/firebase/booking";
import { setStaffProfile } from "@/lib/firebase/db";

type Phase = "loading" | "invalid" | "auth" | "working" | "done" | "error";

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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex items-center justify-between p-6">
        <Logo />
        <Link href="/" className="text-sm font-medium text-muted transition-colors hover:text-brand">
          ← Back to site
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-card border border-line-soft bg-surface p-7 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}

export function StaffJoin() {
  const params = useSearchParams();
  const companyId = params.get("company") ?? "";
  const staffId = params.get("staff") ?? "";
  const { user, loading: authLoading } = useAuth();

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [member, setMember] = React.useState<StaffMember | null>(null);
  const [message, setMessage] = React.useState("");
  const claiming = React.useRef(false);

  // auth form state
  const [pw, setPw] = React.useState("");
  const [authBusy, setAuthBusy] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Load the (public) staff record the invite points at.
  React.useEffect(() => {
    if (!companyId || !staffId) {
      setPhase("invalid");
      return;
    }
    getStaffMember(companyId, staffId)
      .then((m) => {
        if (!m) {
          setPhase("invalid");
          return;
        }
        setMember(m);
      })
      .catch(() => setPhase("invalid"));
  }, [companyId, staffId]);

  const runClaim = React.useCallback(
    async (uid: string, email: string | null) => {
      claiming.current = true;
      setPhase("working");
      try {
        const fresh = await getStaffMember(companyId, staffId);
        if (!fresh) {
          setMessage("This invitation no longer exists.");
          setPhase("error");
          return;
        }
        if (fresh.uid && fresh.uid !== uid) {
          setMessage("This staff profile is already linked to another account.");
          setPhase("error");
          return;
        }
        if (!fresh.uid) {
          if ((fresh.email || "").toLowerCase() !== (email || "").toLowerCase()) {
            setMessage(`This invitation was sent to ${fresh.email}. Please sign in with that email address.`);
            setPhase("error");
            return;
          }
          await claimStaff(companyId, staffId, uid);
        }
        await setStaffProfile(uid, companyId, staffId, email);
        setPhase("done");
        // Full navigation so the auth context reloads with the new staff profile.
        window.location.href = "/staff";
      } catch {
        setMessage("We couldn't accept this invitation. Please check you're signed in with the invited email and try again.");
        setPhase("error");
      }
    },
    [companyId, staffId],
  );

  // Once the member is loaded, either claim (if signed in) or ask to sign in.
  React.useEffect(() => {
    if (!member || claiming.current || authLoading) return;
    if (user) runClaim(user.uid, user.email);
    else setPhase("auth");
  }, [member, user, authLoading, runClaim]);

  const acceptWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setAuthError(null);
    if (pw.length < 6) {
      setAuthError("Use at least 6 characters.");
      return;
    }
    setAuthBusy(true);
    try {
      // Existing account → sign in; otherwise create one with this password.
      try {
        await signInEmail(member.email, pw);
      } catch (err) {
        const code = err instanceof FirebaseError ? err.code : "";
        if (code === "auth/invalid-credential" || code === "auth/user-not-found") {
          await signUpEmail(member.email, pw);
        } else {
          throw err;
        }
      }
      // Auth state change triggers the claim effect.
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : "";
      setAuthError(authErrorMessage(code));
    } finally {
      setAuthBusy(false);
    }
  };

  const acceptWithGoogle = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signInGoogle();
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : "";
      setAuthError(authErrorMessage(code));
    } finally {
      setAuthBusy(false);
    }
  };

  if (phase === "loading" || phase === "working") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="size-7 animate-spin text-brand" />
          <p className="mt-4 text-sm text-muted">
            {phase === "working" ? "Accepting your invitation…" : "Loading your invitation…"}
          </p>
        </div>
      </Shell>
    );
  }

  if (phase === "done") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-success-tint text-success">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">You&apos;re all set</h1>
          <p className="mt-1.5 text-sm text-body">Taking you to your schedule…</p>
        </div>
      </Shell>
    );
  }

  if (phase === "invalid" || phase === "error") {
    return (
      <Shell>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-danger-tint text-danger">
            <AlertCircle className="size-8" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">
            {phase === "invalid" ? "Invalid invitation" : "Couldn't accept invitation"}
          </h1>
          <p className="mt-1.5 text-sm text-body">
            {phase === "invalid"
              ? "This invitation link is missing or no longer valid. Ask the business to resend it."
              : message}
          </p>
          <Link href="/" className="mt-5 text-sm font-semibold text-brand hover:text-brand-dark">
            Back to home
          </Link>
        </div>
      </Shell>
    );
  }

  // phase === "auth"
  return (
    <Shell>
      <div className="mb-5 flex flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-tint text-brand">
          <CalendarClock className="size-6" />
        </span>
        <h1 className="mt-3 font-display text-xl font-bold text-ink">Join the team</h1>
        <p className="mt-1.5 text-sm text-body">
          You&apos;ve been invited as <strong>{member?.name}</strong>
          {member?.role ? ` (${member.role})` : ""}. Set a password to access your schedule.
        </p>
      </div>

      <button
        type="button"
        onClick={acceptWithGoogle}
        disabled={authBusy}
        className="flex w-full items-center justify-center gap-2.5 rounded-btn border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink-800 transition-colors hover:bg-canvas-2 disabled:opacity-60"
      >
        <GoogleIcon className="size-5" /> Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      {authError && (
        <div className="mb-4 rounded-btn border border-danger/30 bg-danger-tint px-3.5 py-2.5 text-[13px] font-medium text-danger">
          {authError}
        </div>
      )}

      <form onSubmit={acceptWithEmail} noValidate className="space-y-4">
        <Field>
          <Label htmlFor="join-email">Email</Label>
          <Input id="join-email" type="email" value={member?.email ?? ""} readOnly className="bg-canvas-2" />
        </Field>
        <Field>
          <Label htmlFor="join-pw" required>Password</Label>
          <Input
            id="join-pw"
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="At least 6 characters"
          />
        </Field>
        <Button type="submit" loading={authBusy} className="w-full">Accept invitation</Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">
        Use the email address the business invited. Signing in with a different email won&apos;t link this profile.
      </p>
    </Shell>
  );
}
