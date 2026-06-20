"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Clock, Pencil, Trash2, LayoutGrid, Loader2, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea, Label, Field, FieldError } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import {
  listServices,
  addService,
  updateService,
  deleteService,
  type Service,
} from "@/lib/firebase/company-data";
import { getCompany } from "@/lib/firebase/content";
import { cn } from "@/lib/utils";

const PLAN_SERVICE_LIMIT: Record<string, number> = { free: 3, standard: 20, premium: 200 };

const empty = { name: "", duration: "30", price: "0", description: "" };

export default function ServicesPage() {
  const { profile } = useAuth();
  const companyId = profile?.companyId ?? null;
  const { toast } = useToast();

  const [services, setServices] = React.useState<Service[]>([]);
  const [plan, setPlan] = React.useState("free");
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const refresh = React.useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    Promise.all([listServices(companyId), getCompany(companyId)])
      .then(([s, c]) => {
        setServices(s);
        if (c) setPlan(c.plan);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  React.useEffect(() => refresh(), [refresh]);

  const limit = PLAN_SERVICE_LIMIT[plan] ?? 3;
  const atLimit = services.length >= limit;

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      duration: String(s.duration),
      price: String(s.price),
      description: s.description ?? "",
    });
    setErrors({});
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Enter a service name.";
    if (!(Number(form.duration) > 0)) err.duration = "Duration must be greater than 0.";
    if (Number(form.price) < 0 || form.price === "") err.price = "Enter a valid price.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        duration: Number(form.duration),
        price: Number(form.price),
        description: form.description.trim(),
      };
      if (editing) await updateService(companyId, editing.id, data);
      else await addService(companyId, data);
      setOpen(false);
      toast({ tone: "success", title: editing ? "Service updated" : "Service added" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't save service", description: "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Service) => {
    if (!companyId) return;
    if (!window.confirm(`Delete "${s.name}"? This can't be undone.`)) return;
    try {
      await deleteService(companyId, s.id);
      toast({ tone: "success", title: "Service deleted" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't delete service" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Services</h1>
          <p className="mt-1 text-[15px] text-body">
            The services customers can book. {services.length}/{limit} used on the{" "}
            <span className="capitalize">{plan}</span> plan.
          </p>
        </div>
        {atLimit ? (
          <Link href="/pricing" className={cn(buttonVariants({ variant: "secondary" }))}>
            <Lock className="size-4" /> Upgrade to add more
          </Link>
        ) : (
          <Button onClick={openAdd}>
            <Plus className="size-4" /> New service
          </Button>
        )}
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid className="size-6" />}
            title="No services yet"
            description="Add your first service so customers know what they can book."
            action={<Button onClick={openAdd} size="sm"><Plus className="size-4" /> Add a service</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="flex flex-col rounded-card border border-line-soft bg-surface p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[17px] font-semibold text-ink-800">{s.name}</h3>
                  <span className="shrink-0 font-display text-lg font-bold text-brand">
                    ${s.price.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Clock className="size-3.5" /> {s.duration} min
                </p>
                {s.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-body">{s.description}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(s)} className="text-danger hover:bg-danger-tint">
                    <Trash2 className="size-3.5" /> Delete
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
        title={editing ? "Edit service" : "New service"}
        description="Customers will see this on your booking page."
      >
        <form onSubmit={save} noValidate className="space-y-4">
          <Field>
            <Label htmlFor="svc-name" required>Service name</Label>
            <Input id="svc-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} invalid={!!errors.name} placeholder="Haircut & style" />
            <FieldError>{errors.name}</FieldError>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="svc-duration" required>Duration (min)</Label>
              <Input id="svc-duration" type="number" min="1" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} invalid={!!errors.duration} />
              <FieldError>{errors.duration}</FieldError>
            </Field>
            <Field>
              <Label htmlFor="svc-price" required>Price ($)</Label>
              <Input id="svc-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} invalid={!!errors.price} />
              <FieldError>{errors.price}</FieldError>
            </Field>
          </div>
          <Field>
            <Label htmlFor="svc-desc">Description</Label>
            <Textarea id="svc-desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What's included (optional)" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Add service"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
