"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login?redirect=/account");
  }, [loading, user, router]);

  return (
    <ToastProvider>
      <Header />
      <main className="flex-1">
        {loading || !user ? (
          <div className="flex min-h-[60vh] items-center justify-center text-muted">
            <Loader2 className="size-7 animate-spin" />
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </ToastProvider>
  );
}
