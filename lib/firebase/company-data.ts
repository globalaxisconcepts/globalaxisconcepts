import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  serviceName: string;
  price: number;
  duration: number;
  staffName: string;
  date: string;
  time: string;
  start: string;
  end: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  payment: "offline" | "online";
  status: BookingStatus;
}

export async function listBookings(companyId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(collection(db, "companies", companyId, "bookings"), orderBy("start", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }));
}

export async function updateBookingStatus(
  companyId: string,
  id: string,
  status: BookingStatus,
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "bookings", id), { status });
}

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description?: string;
}

const servicesCol = (companyId: string) =>
  collection(db, "companies", companyId, "services");

export async function listServices(companyId: string): Promise<Service[]> {
  const snap = await getDocs(query(servicesCol(companyId), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }));
}

export async function addService(
  companyId: string,
  data: Omit<Service, "id">,
): Promise<void> {
  await addDoc(servicesCol(companyId), { ...data, createdAt: serverTimestamp() });
}

export async function updateService(
  companyId: string,
  id: string,
  data: Partial<Omit<Service, "id">>,
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "services", id), data);
}

export async function deleteService(companyId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "companies", companyId, "services", id));
}

export interface CompanyEditable {
  name: string;
  details: string;
  category: string;
  country: string;
}

export async function updateCompany(
  companyId: string,
  data: Partial<CompanyEditable>,
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId), data);
}

export interface NotificationPrefs {
  notifyEmail: boolean;
  notifyEmailTo: string;
  notifySms: boolean;
  notifySmsTo: string;
}

export async function updateNotificationPrefs(
  companyId: string,
  prefs: NotificationPrefs,
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId), { ...prefs });
}
