import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";

export type NotificationType = "booking" | "status" | "system";
export type NotificationAudience = "owner" | "staff";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  audience: NotificationAudience;
  staffId: string | null;
  read: boolean;
  createdAt: number | null; // epoch ms, or null while the server timestamp settles
}

const notifCol = (companyId: string) =>
  collection(db, "companies", companyId, "notifications");

function toNotification(id: string, data: Record<string, unknown>): AppNotification {
  const ts = data.createdAt;
  return {
    id,
    type: (data.type as NotificationType) ?? "system",
    title: (data.title as string) ?? "",
    body: (data.body as string) ?? "",
    audience: (data.audience as NotificationAudience) ?? "owner",
    staffId: (data.staffId as string) ?? null,
    read: Boolean(data.read),
    createdAt: ts instanceof Timestamp ? ts.toMillis() : null,
  };
}

/** Owner inbox: every notification for the company, newest first. */
export async function listOwnerNotifications(companyId: string): Promise<AppNotification[]> {
  try {
    const snap = await getDocs(query(notifCol(companyId), orderBy("createdAt", "desc")));
    return snap.docs
      .map((d) => toNotification(d.id, d.data()))
      .filter((n) => n.audience === "owner");
  } catch {
    return [];
  }
}

/** Staff inbox: notifications targeted at one staff member (single-field query). */
export async function listStaffNotifications(
  companyId: string,
  staffId: string,
): Promise<AppNotification[]> {
  try {
    const snap = await getDocs(query(notifCol(companyId), where("staffId", "==", staffId)));
    return snap.docs
      .map((d) => toNotification(d.id, d.data()))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } catch {
    return [];
  }
}

export async function markNotificationRead(companyId: string, id: string): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "notifications", id), { read: true });
}

export async function markAllNotificationsRead(
  companyId: string,
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.update(doc(db, "companies", companyId, "notifications", id), { read: true });
  }
  await batch.commit();
}

/** Shape used when queuing a notification inside another write batch. */
export interface NotificationDraft {
  type: NotificationType;
  title: string;
  body: string;
  audience: NotificationAudience;
  staffId?: string | null;
}

export function notificationDocData(draft: NotificationDraft) {
  return {
    type: draft.type,
    title: draft.title,
    body: draft.body,
    audience: draft.audience,
    staffId: draft.staffId ?? null,
    read: false,
    createdAt: serverTimestamp(),
  };
}
