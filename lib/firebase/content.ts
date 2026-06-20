import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./client";
import { categoryByValue } from "@/lib/data/categories";

const AVATAR_GRADIENTS = [
  "from-accent-purple to-brand",
  "from-brand to-brand-dark",
  "from-success to-accent-teal",
  "from-accent-orange to-warning",
  "from-accent-teal to-brand",
  "from-accent-orange to-accent-purple",
  "from-brand-dark to-accent-purple",
  "from-accent-teal to-success",
];

/** Stable index from a string so a company always gets the same avatar. */
function hashIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export interface DirectoryCompany {
  slug: string;
  name: string;
  category: string;
  country: string;
  tagline: string;
  initials: string;
  avatar: string;
}

export interface CompanyDoc {
  slug: string;
  name: string;
  category: string;
  country: string;
  details: string;
  plan: string;
  ownerUid: string;
  notifyEmail: boolean;
  notifyEmailTo: string;
  notifySms: boolean;
  notifySmsTo: string;
}

function toCard(id: string, data: Record<string, unknown>): DirectoryCompany {
  const name = (data.name as string) ?? id;
  const slug = (data.slug as string) ?? id;
  return {
    slug,
    name,
    category: (data.category as string) ?? "other",
    country: (data.country as string) ?? "",
    tagline:
      (data.details as string) ||
      `${categoryByValue((data.category as string) ?? "")?.label ?? "Services"} on Global Axis Concepts.`,
    initials: initialsOf(name) || "GA",
    avatar: AVATAR_GRADIENTS[hashIndex(slug, AVATAR_GRADIENTS.length)],
  };
}

/** All companies for the public directory. */
export async function getCompanies(): Promise<DirectoryCompany[]> {
  const snap = await getDocs(query(collection(db, "companies"), orderBy("name")));
  return snap.docs.map((d) => toCard(d.id, d.data()));
}

/** A single company by slug (== document id). */
export async function getCompany(slug: string): Promise<CompanyDoc | null> {
  const snap = await getDoc(doc(db, "companies", slug));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    slug,
    name: (data.name as string) ?? slug,
    category: (data.category as string) ?? "other",
    country: (data.country as string) ?? "",
    details: (data.details as string) ?? "",
    plan: (data.plan as string) ?? "free",
    ownerUid: (data.ownerUid as string) ?? "",
    notifyEmail: Boolean(data.notifyEmail),
    notifyEmailTo: (data.notifyEmailTo as string) ?? "",
    notifySms: Boolean(data.notifySms),
    notifySmsTo: (data.notifySmsTo as string) ?? "",
  };
}
