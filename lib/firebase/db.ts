import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";

export interface UserProfile {
  role: "business-owner" | "staff" | "customer" | "super-admin";
  companyId: string | null;
  email: string | null;
  /** Set for staff: which staff doc in the company this user is linked to. */
  staffId?: string | null;
}

/** True if no company has claimed this slug yet. */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "slugs", slug));
  return !snap.exists();
}

/** Read a user's profile doc (role + companyId). Null if not created yet. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Create/refresh a staff member's profile mirror after they claim an invite. */
export async function setStaffProfile(
  uid: string,
  companyId: string,
  staffId: string,
  email: string | null,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { role: "staff", companyId, staffId, email, createdAt: serverTimestamp() },
    { merge: true },
  );
}

export interface NewCompanyInput {
  slug: string;
  name: string;
  category: string;
  details?: string;
  country?: string;
  plan?: string;
  ownerUid: string;
  ownerEmail: string | null;
}

/**
 * Atomically create a company, claim its slug, and create the owner's user
 * profile. The slug doubles as the companyId (slugs are unique + URL-safe).
 */
export async function createCompany(input: NewCompanyInput): Promise<void> {
  const batch = writeBatch(db);
  const companyId = input.slug;

  batch.set(doc(db, "companies", companyId), {
    slug: input.slug,
    name: input.name,
    category: input.category,
    details: input.details ?? "",
    country: input.country ?? "",
    plan: input.plan ?? "free",
    ownerUid: input.ownerUid,
    createdAt: serverTimestamp(),
  });

  batch.set(doc(db, "slugs", input.slug), { companyId });

  batch.set(doc(db, "users", input.ownerUid), {
    role: "business-owner",
    companyId,
    email: input.ownerEmail,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}
