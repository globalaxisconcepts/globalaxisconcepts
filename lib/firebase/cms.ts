import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db } from "./client";
import { PLANS } from "@/lib/data/plans";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { FAQS } from "@/lib/data/faqs";
import type { Plan, BlogPost, Faq } from "@/lib/types";

export interface FaqDoc extends Faq {
  id: string;
}

const defaultFaqs = (): FaqDoc[] =>
  FAQS.map((f, i) => ({ id: `default-${i}`, ...f }));

// ── Reads (fall back to code-defined defaults when the collection is empty) ──

export async function getPlans(): Promise<Plan[]> {
  try {
    const snap = await getDocs(query(collection(db, "plans"), orderBy("monthly")));
    if (snap.empty) return PLANS;
    return snap.docs.map((d) => d.data() as Plan);
  } catch {
    return PLANS;
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const snap = await getDocs(query(collection(db, "blogs"), orderBy("date", "desc")));
    if (snap.empty) return BLOG_POSTS;
    return snap.docs.map((d) => d.data() as BlogPost);
  } catch {
    return BLOG_POSTS;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const snap = await getDoc(doc(db, "blogs", slug));
    if (snap.exists()) return snap.data() as BlogPost;
  } catch {
    /* fall through to defaults */
  }
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export async function getFaqs(): Promise<FaqDoc[]> {
  try {
    const snap = await getDocs(query(collection(db, "faqs"), orderBy("order")));
    if (snap.empty) return defaultFaqs();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Faq) }));
  } catch {
    return defaultFaqs();
  }
}

// ── Writes (super-admin only, enforced by security rules) ───────────────────

export async function upsertPlan(plan: Plan): Promise<void> {
  await setDoc(doc(db, "plans", plan.id), plan);
}

export async function upsertBlog(post: BlogPost): Promise<void> {
  await setDoc(doc(db, "blogs", post.slug), post);
}
export async function deleteBlog(slug: string): Promise<void> {
  await deleteDoc(doc(db, "blogs", slug));
}

export async function upsertFaq(id: string, faq: Faq, order: number): Promise<void> {
  await setDoc(doc(db, "faqs", id), { ...faq, order });
}
export async function deleteFaq(id: string): Promise<void> {
  await deleteDoc(doc(db, "faqs", id));
}

/** Import the code-defined defaults into Firestore (idempotent). */
export async function seedDefaults(): Promise<{ plans: number; blogs: number; faqs: number }> {
  const batch = writeBatch(db);
  PLANS.forEach((p) => batch.set(doc(db, "plans", p.id), p));
  BLOG_POSTS.forEach((b) => batch.set(doc(db, "blogs", b.slug), b));
  FAQS.forEach((f, i) => batch.set(doc(db, "faqs", `faq-${i + 1}`), { ...f, order: i }));
  await batch.commit();
  return { plans: PLANS.length, blogs: BLOG_POSTS.length, faqs: FAQS.length };
}
