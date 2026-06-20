"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, Field, FieldError } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { getBlogPosts, upsertBlog, deleteBlog } from "@/lib/firebase/cms";
import type { BlogPost } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ACCENTS = [
  "from-brand to-brand-dark",
  "from-accent-purple to-brand",
  "from-success to-accent-teal",
  "from-accent-orange to-warning",
  "from-brand to-accent-teal",
  "from-accent-teal to-brand",
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const emptyForm = {
  slug: "", title: "", excerpt: "", category: "Growth", author: "The Global Axis Team",
  date: "2026-06-20", readMinutes: "5", accent: ACCENTS[0], body: "",
};

export default function AdminBlogs() {
  const { toast } = useToast();
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editingSlug, setEditingSlug] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  const refresh = React.useCallback(() => {
    setLoading(true);
    getBlogPosts().then(setPosts).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => refresh(), [refresh]);

  const openNew = () => { setEditingSlug(null); setForm(emptyForm); setErrors({}); setOpen(true); };
  const openEdit = (p: BlogPost) => {
    setEditingSlug(p.slug);
    setForm({
      slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category,
      author: p.author, date: p.date, readMinutes: String(p.readMinutes),
      accent: p.accent, body: p.body.join("\n\n"),
    });
    setErrors({});
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = editingSlug ?? (form.slug.trim() || slugify(form.title));
    const err: Record<string, string> = {};
    if (!form.title.trim()) err.title = "Title is required.";
    if (!slug) err.slug = "Slug is required.";
    if (!form.excerpt.trim()) err.excerpt = "Excerpt is required.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const post: BlogPost = {
        slug,
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        category: form.category,
        author: form.author.trim() || "The Global Axis Team",
        date: form.date,
        readMinutes: Number(form.readMinutes) || 5,
        accent: form.accent,
        body: form.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      };
      await upsertBlog(post);
      setOpen(false);
      toast({ tone: "success", title: editingSlug ? "Post updated" : "Post published" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't save post", description: "Sign in as the platform owner." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: BlogPost) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      await deleteBlog(p.slug);
      toast({ tone: "success", title: "Post deleted" });
      refresh();
    } catch {
      toast({ tone: "error", title: "Couldn't delete post" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Blog posts</h1>
          <p className="mt-1 text-[15px] text-body">Articles shown on the public blog.</p>
        </div>
        <Button onClick={openNew}><Plus className="size-4" /> New post</Button>
      </div>

      <div className="mt-7">
        {loading ? (
          <div className="flex justify-center py-16 text-muted"><Loader2 className="size-6 animate-spin" /></div>
        ) : posts.length === 0 ? (
          <EmptyState icon={<FileText className="size-6" />} title="No posts yet" description="Publish your first article." action={<Button size="sm" onClick={openNew}><Plus className="size-4" /> New post</Button>} />
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.slug} className="flex items-center gap-4 rounded-card border border-line-soft bg-surface p-4 shadow-xs">
                <div className={`hidden h-12 w-16 shrink-0 rounded-lg bg-gradient-to-br sm:block ${p.accent}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral" size="sm">{p.category}</Badge>
                    <span className="text-xs text-muted">{formatDate(p.date)}</span>
                  </div>
                  <h3 className="mt-1 truncate font-display font-semibold text-ink-800">{p.title}</h3>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(p)}><Pencil className="size-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(p)} className="text-danger hover:bg-danger-tint"><Trash2 className="size-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title={editingSlug ? "Edit post" : "New post"}>
        <form onSubmit={save} noValidate className="space-y-4">
          <Field>
            <Label htmlFor="b-title" required>Title</Label>
            <Input id="b-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} invalid={!!errors.title} />
            <FieldError>{errors.title}</FieldError>
          </Field>
          {!editingSlug && (
            <Field>
              <Label htmlFor="b-slug">Slug</Label>
              <Input id="b-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder={slugify(form.title) || "auto-from-title"} />
              <FieldError>{errors.slug}</FieldError>
            </Field>
          )}
          <Field>
            <Label htmlFor="b-excerpt" required>Excerpt</Label>
            <Textarea id="b-excerpt" rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} invalid={!!errors.excerpt} />
            <FieldError>{errors.excerpt}</FieldError>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="b-cat">Category</Label>
              <Input id="b-cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </Field>
            <Field>
              <Label htmlFor="b-date">Date</Label>
              <Input id="b-date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field>
              <Label htmlFor="b-author">Author</Label>
              <Input id="b-author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            </Field>
            <Field>
              <Label htmlFor="b-read">Read (min)</Label>
              <Input id="b-read" type="number" min="1" value={form.readMinutes} onChange={(e) => setForm((f) => ({ ...f, readMinutes: e.target.value }))} />
            </Field>
          </div>
          <Field>
            <Label htmlFor="b-accent">Cover gradient</Label>
            <Select id="b-accent" value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))}>
              {ACCENTS.map((a) => <option key={a} value={a}>{a.replace(/from-|to-/g, "").replace("-", " → ")}</option>)}
            </Select>
          </Field>
          <Field>
            <Label htmlFor="b-body">Body (separate paragraphs with a blank line)</Label>
            <Textarea id="b-body" rows={6} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingSlug ? "Save changes" : "Publish"}</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
