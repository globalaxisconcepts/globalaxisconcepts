import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./client";
import type { BookingStatus } from "./company-data";

export interface MyBooking {
  id: string;
  bookingId: string;
  companyId: string;
  companyName: string;
  serviceName: string;
  staffName: string;
  price: number;
  date: string;
  time: string;
  start: string;
  payment: "offline" | "online";
  status: BookingStatus;
}

/**
 * The signed-in customer's own bookings (from the private mirror under their
 * user doc), with each status refreshed from the authoritative company booking
 * so changes the business makes show up. Falls back to the stored snapshot.
 */
export async function getMyBookings(uid: string): Promise<MyBooking[]> {
  const snap = await getDocs(
    query(collection(db, "users", uid, "myBookings"), orderBy("start", "desc")),
  );
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MyBooking, "id">) }));

  await Promise.all(
    rows.map(async (row) => {
      try {
        const live = await getDoc(
          doc(db, "companies", row.companyId, "bookings", row.bookingId),
        );
        if (live.exists()) row.status = (live.data().status as BookingStatus) ?? row.status;
      } catch {
        // keep the snapshot status
      }
    }),
  );

  return rows;
}
