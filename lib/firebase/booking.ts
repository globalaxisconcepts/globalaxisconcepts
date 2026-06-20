import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";
import { notificationDocData } from "./notifications";
import type { Booking } from "./company-data";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  /** Service IDs this member can perform. Empty = can perform every service. */
  assignedServiceIds: string[];
  /** Set once the staff member has claimed their portal login. */
  uid: string;
}

// Default opening hours used to generate bookable slots (per-staff hours come later).
export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 17;
const SLOT_STEP_MIN = 30;

/** Candidate "HH:mm" start times where a service of `durationMin` fits before close. */
export function generateTimeSlots(durationMin: number): string[] {
  const slots: string[] = [];
  const startMin = BUSINESS_START_HOUR * 60;
  const lastStart = BUSINESS_END_HOUR * 60 - durationMin;
  for (let m = startMin; m <= lastStart; m += SLOT_STEP_MIN) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return slots;
}

const staffCol = (companyId: string) => collection(db, "companies", companyId, "staff");

export async function getStaff(companyId: string): Promise<StaffMember[]> {
  try {
    const snap = await getDocs(query(staffCol(companyId), orderBy("name")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: (data.name as string) ?? "Staff",
        role: (data.role as string) ?? "",
        email: (data.email as string) ?? "",
        assignedServiceIds: (data.assignedServiceIds as string[]) ?? [],
        uid: (data.uid as string) ?? "",
      };
    });
  } catch {
    return [];
  }
}

export async function getStaffMember(
  companyId: string,
  staffId: string,
): Promise<StaffMember | null> {
  const snap = await getDoc(doc(db, "companies", companyId, "staff", staffId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: (data.name as string) ?? "Staff",
    role: (data.role as string) ?? "",
    email: (data.email as string) ?? "",
    assignedServiceIds: (data.assignedServiceIds as string[]) ?? [],
    uid: (data.uid as string) ?? "",
  };
}

/** Staff self-claim: stamp their uid onto the staff doc (email-gated by rules). */
export async function claimStaff(companyId: string, staffId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "staff", staffId), { uid });
}

// `uid` is never edited through the dashboard form — exclude it so an owner
// edit can never wipe a claimed link.
export type StaffInput = Omit<StaffMember, "id" | "uid">;

export async function addStaff(companyId: string, data: StaffInput): Promise<void> {
  await addDoc(staffCol(companyId), { ...data, createdAt: serverTimestamp() });
}

export async function updateStaff(
  companyId: string,
  id: string,
  data: Partial<StaffInput>,
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "staff", id), data);
}

export async function deleteStaff(companyId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "companies", companyId, "staff", id));
}

/** Bookings assigned to a single staff member, newest first (their schedule). */
export async function listStaffBookings(companyId: string, staffId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(collection(db, "companies", companyId, "bookings"), where("staffId", "==", staffId)),
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }))
    .sort((a, b) => b.start.localeCompare(a.start));
}

/** Times already taken on a given date ("HH:mm"). */
export async function getBookedTimes(companyId: string, date: string): Promise<string[]> {
  try {
    const snap = await getDocs(
      query(collection(db, "companies", companyId, "booked"), where("date", "==", date)),
    );
    return snap.docs.map((d) => (d.data().time as string)).filter(Boolean);
  } catch {
    return [];
  }
}

export interface BookingInput {
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  staffId: string | null;
  staffName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  payment: "offline" | "online";
  /** Set when the booker is signed in → enables their /account view. */
  customerUid: string | null;
  /** For the customer's mirror + notification copy. */
  companyName: string;
}

function fmtDateTime(date: string, time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const d = new Date(`${date}T${time}:00`);
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day} at ${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Create a booking + claim the slot atomically. The slot marker uses a
 * create-if-absent rule, so a taken slot makes the whole batch fail. The same
 * batch also drops in-app notifications and (for signed-in customers) a private
 * copy under their user doc.
 */
export async function createBooking(companyId: string, input: BookingInput): Promise<string> {
  const start = new Date(`${input.date}T${input.time}:00`);
  const end = new Date(start.getTime() + input.duration * 60000);
  const slotId = `${input.date}_${input.time}`;
  const status = input.payment === "online" ? "confirmed" : "pending";
  const when = fmtDateTime(input.date, input.time);

  const batch = writeBatch(db);
  const bookingRef = doc(collection(db, "companies", companyId, "bookings"));
  batch.set(bookingRef, {
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    price: input.price,
    duration: input.duration,
    staffId: input.staffId,
    staffName: input.staffName,
    date: input.date,
    time: input.time,
    start: start.toISOString(),
    end: end.toISOString(),
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerUid: input.customerUid,
    notes: input.notes,
    payment: input.payment,
    status,
    createdAt: serverTimestamp(),
  });

  batch.set(doc(db, "companies", companyId, "booked", slotId), {
    date: input.date,
    time: input.time,
    start: start.toISOString(),
    serviceId: input.serviceId,
  });

  // In-app notification for the business owner.
  batch.set(doc(collection(db, "companies", companyId, "notifications")), notificationDocData({
    type: "booking",
    title: "New booking",
    body: `${input.customerName} booked ${input.serviceName} — ${when}.`,
    audience: "owner",
  }));

  // And one for the assigned staff member, if a specific person was chosen.
  if (input.staffId) {
    batch.set(doc(collection(db, "companies", companyId, "notifications")), notificationDocData({
      type: "booking",
      title: "New appointment",
      body: `${input.customerName} booked ${input.serviceName} with you — ${when}.`,
      audience: "staff",
      staffId: input.staffId,
    }));
  }

  // Signed-in customer → keep a private copy they can see at /account.
  if (input.customerUid) {
    batch.set(doc(db, "users", input.customerUid, "myBookings", bookingRef.id), {
      bookingId: bookingRef.id,
      companyId,
      companyName: input.companyName,
      serviceName: input.serviceName,
      staffName: input.staffName,
      price: input.price,
      date: input.date,
      time: input.time,
      start: start.toISOString(),
      payment: input.payment,
      status,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return bookingRef.id;
}
