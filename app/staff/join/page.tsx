import { Suspense } from "react";
import type { Metadata } from "next";
import { StaffJoin } from "@/components/staff/staff-join";

export const metadata: Metadata = {
  title: "Accept staff invitation",
  description: "Join your team on Global Axis Concepts.",
};

export default function StaffJoinPage() {
  return (
    <Suspense>
      <StaffJoin />
    </Suspense>
  );
}
