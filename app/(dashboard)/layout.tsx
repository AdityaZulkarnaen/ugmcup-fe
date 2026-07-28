"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadAuth } from "@/lib/api/auth";

/**
 * Layout untuk semua route (dashboard) — hanya melakukan auth check dasar.
 * Guard detail (role check) dilakukan di masing-masing page.
 */
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const auth = loadAuth();
    if (!auth) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
