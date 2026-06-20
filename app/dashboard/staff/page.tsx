"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Users, Loader2, Lock, Mail, Briefcase, Copy, Link2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Field, FieldError, FieldHint } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { getStaff, addStaff, updateStaff, deleteStaff, type StaffMember } from "@/lib/firebase/booking";
import { listServices, type Service } from "@/lib/firebase/company-data";
import { getCompany } from "@/lib/firebase/content";
import { cn } from "@/lib/utils";

const PLAN_STAFF_LIMIT: Record<string, number> = { free: 2, standard: 10, premium: 100 };
const AVATARS = ["from-accent-purple to-brand", "from-brand to-brand-dark", "from-success to-accent-teal", "from-accent-orange to-warning"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const empty = { name: "", role: "", email: "" };
function initialsOf(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function StaffPage() {
  const { profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const { toast } = useToast();

  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [plan, setPlan] = React.useState("free");
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StaffMember | null>(null);
  const [form, setForm] = React.useState(empty);
  const [assigned, setAssigned] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const refresh = React.useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([getStaff(companyId), listServices(companyId), getCompany(companyId)])
      .then(([st, svc, c]) => {
        setStaff(st);
        setServices(svc);
        if (c) setPlan(c.plan);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  React.useEffect(() => refresh(), [refresh]);

  const limit = PLAN_STAFF_LIMIT[plan] ?? 2;
  const atLimit = staff.length >= limit;
  const serviceName = (id: string) => services.find((s) => s.id === id)?.name;

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setAssigned([]);
    setErrors({});
    setOpen(true);
  };
  const openEdit = (m: StaffMember) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, email: m.email });
    setAssigned(m.assignedServiceIds);
    setErrors({});
    setOpen(true);
  };

  const toggleService = (id: string) =>
    setAssigned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Enter the team member's name.";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) err.email = "Enter a valid email.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        assignedServiceIds: assigned.filter((id) => services.some((s) => s.id === id)),
      };
      if (editing) await updateStaff(companyId, editing.id, data);
      else await addStaff(companyId, data);
      setOpen(false);
      toast({ tone: "success", title: editing ? "Team member updated" : "Team member added" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't save team member", description: "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const copyInvite = async (m: StaffMember) => {
    if (!companyId) return;
    const link = `${window.location.origin}/staff/join?company=${encodeURIComponent(companyId)}&staff=${encodeURIComponent(m.id)}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ tone: "success", title: "Invite link copied", description: `Send it to ${m.email} so they can sign in.` });
    } catch {
      toast({ tone: "info", title: "Invite link", description: link });
    }
  };

  const remove = async (m: StaffMember) => {
    if (!companyId) return;
    if (!window.confirm(`Remove ${m.name} from your team? This can't be undone.`)) return;
    try {
      await deleteStaff(companyId, m.id);
      toast({ tone: "success", title: "Team member removed" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't remove team member" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Staff</h1>
          <p className="mt-1 text-[15px] text-body">
            Team members customers can book with. {staff.length}/{limit} used on the{" "}
            <span className="capitalize">{plan}</span> plan.
          </p>
        </div>
        {atLimit ? (
          <Link href="/pricing" className={cn(buttonVariants({ variant: "secondary" }))}>
            <Lock className="size-4" /> Upgrade to add more
          </Link>
        ) : (
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New team member
          </Button>
        )}
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <EmptyState
            icon={<Users className="size-6" />}
            title="No team members yet"
            description="Add the people who provide your services so customers can pick who they book with."
            action={<Button onClick={openAdd} size="sm"><Plus className="size-4" /> Add a team member</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {staff.map((m, i) => (
              <div key={m.id} className="flex flex-col rounded-card border border-line-soft bg-surface p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-sm font-bold text-white", AVATARS[i % AVATARS.length])}>
                    {initialsOf(m.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-[17px] font-semibold text-ink-800">{m.name}</h3>
                    {m.role && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
                        <Briefcase className="size-3.5" /> {m.role}
                      </p>
                    )}
                  </div>
                </div>
                {m.email && (
                  <p className="mt-3 flex items-center gap-2 truncate text-sm text-body">
                    <Mail className="size-3.5 shrink-0 text-muted" /> {m.email}
                  </p>
                )}
                <div className="mt-3">
                  {m.assignedServiceIds.length === 0 ? (
                    <span className="rounded-pill bg-canvas-2 px-2.5 py-1 text-xs font-medium text-muted">All services</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {m.assignedServiceIds.map((id) => serviceName(id)).filter(Boolean).map((name) => (
                        <span key={name} className="rounded-pill bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand">{name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {m.uid ? (
                    <Badge tone="success" size="sm">Active</Badge>
                  ) : m.email ? (
                    <>
                      <Badge tone="warning" size="sm">Invite pending</Badge>
                      <button
                        onClick={() => copyInvite(m)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
                      >
                        <Copy className="size-3.5" /> Copy invite link
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Link2 className="size-3.5" /> Add an email to send an invite
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(m)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(m)} className="text-danger hover:bg-danger-tint">
                    <Trash2 className="size-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit team member" : "New team member"}
        description="Customers can pick this person on your booking page."
      >
        <form onSubmit={save} noValidate className="space-y-4">
          <Field>
            <Label htmlFor="st-name" required>Full name</Label>
            <Input id="st-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} invalid={!!errors.name} placeholder="Jane Cooper" />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="st-role">Role / title</Label>
              <Input id="st-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="Senior stylist" />
            </Field>
            <Field>
              <Label htmlFor="st-email">Email</Label>
              <Input id="st-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} invalid={!!errors.email} placeholder="jane@email.com" />
              <FieldError>{errors.email}</FieldError>
            </Field>
          </div>
          <Field>
            <Label>Services they provide</Label>
            {services.length === 0 ? (
              <FieldHint>
                Add services first and you can assign them here. For now this member can perform any service.
              </FieldHint>
            ) : (
              <>
                <div className="mt-1 space-y-2">
                  {services.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-btn border border-line px-3 py-2.5 text-sm transition-colors hover:border-brand/40">
                      <input
                        type="checkbox"
                        checked={assigned.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        className="size-4 accent-brand"
                      />
                      <span className="font-medium text-ink-800">{s.name}</span>
                    </label>
                  ))}
                </div>
                <FieldHint>Leave all unchecked to let this member perform every service.</FieldHint>
              </>
            )}
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Add team member"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
