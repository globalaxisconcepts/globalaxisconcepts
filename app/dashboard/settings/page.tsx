"use client";

import * as React from "react";
import { Loader2, Mail, MessageSquare, Info, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, Field, FieldError } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { getCompany } from "@/lib/firebase/content";
import { updateCompany, updateNotificationPrefs, type NotificationPrefs } from "@/lib/firebase/company-data";
import { CATEGORIES } from "@/lib/data/categories";
import { COUNTRIES } from "@/lib/data/countries";

export default function SettingsPage() {
  const { profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const { toast } = useToast();

  const [form, setForm] = React.useState({ name: "", details: "", category: "", country: "" });
  const [prefs, setPrefs] = React.useState<NotificationPrefs>({
    notifyEmail: false, notifyEmailTo: "", notifySms: false, notifySmsTo: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savingPrefs, setSavingPrefs] = React.useState(false);
  const [nameError, setNameError] = React.useState("");

  React.useEffect(() => {
    if (!companyId) return;
    getCompany(companyId)
      .then((c) => {
        if (c) {
          setForm({ name: c.name, details: c.details, category: c.category, country: c.country });
          setPrefs({
            notifyEmail: c.notifyEmail,
            notifyEmailTo: c.notifyEmailTo,
            notifySms: c.notifySms,
            notifySmsTo: c.notifySmsTo,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  const savePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSavingPrefs(true);
    try {
      await updateNotificationPrefs(companyId, {
        ...prefs,
        notifyEmailTo: prefs.notifyEmailTo.trim(),
        notifySmsTo: prefs.notifySmsTo.trim(),
      });
      toast({ tone: "success", title: "Notification preferences saved" });
    } catch {
      toast({ tone: "error", title: "Couldn't save preferences", description: "Please try again." });
    } finally {
      setSavingPrefs(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!form.name.trim()) return setNameError("Company name is required.");
    setNameError("");
    setSaving(true);
    try {
      await updateCompany(companyId, {
        name: form.name.trim(),
        details: form.details.trim(),
        category: form.category,
        country: form.country,
      });
      toast({ tone: "success", title: "Settings saved" });
    } catch {
      toast({ tone: "error", title: "Couldn't save settings", description: "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
      <p className="mt-1 text-[15px] text-body">Manage your company profile.</p>

      {loading ? (
        <div className="flex justify-center py-16 text-muted">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <form onSubmit={save} noValidate className="mt-7 space-y-5 rounded-card border border-line-soft bg-surface p-6 shadow-xs">
          <Field>
            <Label>Company URL</Label>
            <div className="flex items-center rounded-sm border border-line bg-canvas-2 px-3 py-3 text-[15px] text-muted">
              <span className="font-mono">globalaxisconcepts.com/{companyId}</span>
            </div>
            <p className="mt-1.5 text-[13px] text-muted">Your booking page URL cannot be changed.</p>
          </Field>

          <Field>
            <Label htmlFor="name" required>Company name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} invalid={!!nameError} />
            <FieldError>{nameError}</FieldError>
          </Field>

          <Field>
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="country">Country</Label>
            <Select id="country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}>
              <option value="">Not specified</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>

          <Field>
            <Label htmlFor="details">Company details</Label>
            <Textarea id="details" rows={4} value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} placeholder="A short description shown on your booking page" />
          </Field>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      )}

      {!loading && (
        <form onSubmit={savePrefs} className="mt-6 space-y-5 rounded-card border border-line-soft bg-surface p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-tint text-brand">
              <Bell className="size-[18px]" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-800">Notifications</h2>
              <p className="text-sm text-muted">Get alerted when customers book.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-btn border border-brand/20 bg-brand-tint/60 px-4 py-3 text-[13px] text-ink-800">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" />
            <p>
              In-app alerts (the bell above) work right now. Email &amp; SMS delivery turns on once a sending
              service is connected — your preferences here are saved and ready for that.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-btn border border-line p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={prefs.notifyEmail}
                  onChange={(e) => setPrefs((p) => ({ ...p, notifyEmail: e.target.checked }))}
                  className="size-4 accent-brand"
                />
                <Mail className="size-4 text-muted" />
                <span className="text-sm font-medium text-ink-800">Email notifications</span>
              </label>
              {prefs.notifyEmail && (
                <div className="mt-3 pl-7">
                  <Input
                    type="email"
                    placeholder="where to send (e.g. you@business.com)"
                    value={prefs.notifyEmailTo}
                    onChange={(e) => setPrefs((p) => ({ ...p, notifyEmailTo: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="rounded-btn border border-line p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={prefs.notifySms}
                  onChange={(e) => setPrefs((p) => ({ ...p, notifySms: e.target.checked }))}
                  className="size-4 accent-brand"
                />
                <MessageSquare className="size-4 text-muted" />
                <span className="text-sm font-medium text-ink-800">SMS notifications</span>
              </label>
              {prefs.notifySms && (
                <div className="mt-3 pl-7">
                  <Input
                    type="tel"
                    placeholder="mobile number (e.g. +1 555 000 0000)"
                    value={prefs.notifySmsTo}
                    onChange={(e) => setPrefs((p) => ({ ...p, notifySmsTo: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={savingPrefs}>Save preferences</Button>
          </div>
        </form>
      )}
    </div>
  );
}
