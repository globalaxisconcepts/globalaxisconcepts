"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Field, FieldError } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { getFaqs, upsertFaq, deleteFaq, type FaqDoc } from "@/lib/firebase/cms";

export default function AdminFaqs() {
  const { toast } = useToast();
  const [faqs, setFaqs] = React.useState<FaqDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FaqDoc | null>(null);
  const [form, setForm] = React.useState({ question: "", answer: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    getFaqs().then(setFaqs).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => refresh(), [refresh]);

  const openNew = () => { setEditing(null); setForm({ question: "", answer: "" }); setErrors({}); setOpen(true); };
  const openEdit = (f: FaqDoc) => { setEditing(f); setForm({ question: f.question, answer: f.answer }); setErrors({}); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.question.trim()) err.question = "Question is required.";
    if (!form.answer.trim()) err.answer = "Answer is required.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const id = editing?.id && !editing.id.startsWith("default-") ? editing.id : `faq-${crypto.randomUUID().slice(0, 8)}`;
      const order = editing ? faqs.findIndex((f) => f.id === editing.id) : faqs.length;
      await upsertFaq(id, { question: form.question.trim(), answer: form.answer.trim() }, order);
      setOpen(false);
      toast({ tone: "success", title: editing ? "FAQ updated" : "FAQ added" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't save FAQ", description: "Sign in as the platform owner." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f: FaqDoc) => {
    if (f.id.startsWith("default-")) {
      toast({ tone: "info", title: "Import default content first", description: "Run 'Import default content' on the Overview to manage FAQs." });
      return;
    }
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await deleteFaq(f.id);
      toast({ tone: "success", title: "FAQ deleted" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't delete FAQ" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">FAQs</h1>
          <p className="mt-1 text-[15px] text-body">Questions shown on the public FAQ page.</p>
        </div>
        <Button onClick={openNew}><Plus className="size-4" /> New FAQ</Button>
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted"><Loader2 className="size-6 animate-spin" /></div>
        ) : faqs.length === 0 ? (
          <EmptyState icon={<HelpCircle className="size-6" />} title="No FAQs yet" description="Add your first question." action={<Button size="sm" onClick={openNew}><Plus className="size-4" /> New FAQ</Button>} />
        ) : (
          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="rounded-card border border-line-soft bg-surface p-4 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-semibold text-ink-800">{f.question}</h3>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(f)}><Pencil className="size-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(f)} className="text-danger hover:bg-danger-tint"><Trash2 className="size-3.5" /></Button>
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-body">{f.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Edit FAQ" : "New FAQ"}>
        <form onSubmit={save} noValidate className="space-y-4">
          <Field>
            <Label htmlFor="f-q" required>Question</Label>
            <Input id="f-q" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} invalid={!!errors.question} />
            <FieldError>{errors.question}</FieldError>
          </Field>
          <Field>
            <Label htmlFor="f-a" required>Answer</Label>
            <Textarea id="f-a" rows={5} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} invalid={!!errors.answer} />
            <FieldError>{errors.answer}</FieldError>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? "Save changes" : "Add FAQ"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
