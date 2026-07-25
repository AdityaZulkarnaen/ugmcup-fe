"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import { AdminHome } from "@/modules/admin/components/AdminHome";
import { InstitusiSection } from "@/modules/admin/components/InstitusiSection";
import { AtletSection } from "@/modules/admin/components/AtletSection";
import { PesertaSection } from "@/modules/admin/components/PesertaSection";
import { JadwalSection } from "@/modules/admin/components/JadwalSection";
import { BracketSection } from "@/modules/admin/components/BracketSection";
import { GrupSection } from "@/modules/admin/components/GrupSection";
import { AuditLogSection } from "@/modules/admin/components/AuditLogSection";

type Section =
  | "beranda" | "institusi" | "atlet" | "peserta"
  | "jadwal" | "bracket" | "grup" | "audit-log";

const SIDEBAR_ITEMS = [
  { key: "beranda",    label: "Beranda",          icon: "🏠" },
  { key: "institusi",  label: "Institusi",         icon: "🏛️" },
  { key: "atlet",      label: "Atlet",             icon: "🏸" },
  { key: "peserta",    label: "Peserta & Tim",     icon: "👥" },
  { key: "jadwal",     label: "Jadwal Pertandingan", icon: "🗓️" },
  { key: "bracket",    label: "Bracket",           icon: "🔀" },
  { key: "grup",       label: "Grup & Klasemen",   icon: "📊" },
  { key: "audit-log",  label: "Audit Log",         icon: "📋" },
];

export default function AdminPage() {
  const { user, isLoading, logout } = useRequireRole("SUPER_ADMIN");
  const [section, setSection] = useState<Section>("beranda");

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--dash-body-bg)" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#66FFB4" }} />
      </div>
    );
  }

  function renderSection() {
    switch (section) {
      case "beranda":   return <AdminHome />;
      case "institusi": return <InstitusiSection />;
      case "atlet":     return <AtletSection />;
      case "peserta":   return <PesertaSection />;
      case "jadwal":    return <JadwalSection />;
      case "bracket":   return <BracketSection />;
      case "grup":      return <GrupSection />;
      case "audit-log": return <AuditLogSection />;
      default:          return <AdminHome />;
    }
  }

  return (
    <DashboardLayout
      sidebarItems={SIDEBAR_ITEMS}
      activeSection={section}
      onSectionChange={(key) => setSection(key as Section)}
      roleBadge="Super Admin"
      roleColor="#8352D9"
      username={user.username}
      onLogout={logout}
    >
      <div className="p-8">{renderSection()}</div>
    </DashboardLayout>
  );
}
