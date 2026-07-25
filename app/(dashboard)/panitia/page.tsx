"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import { PanitiaHome } from "@/modules/panitia/components/PanitiaHome";
import { MatchAktifSection } from "@/modules/panitia/components/MatchAktifSection";
import { JadwalPanitiaSection } from "@/modules/panitia/components/JadwalPanitiaSection";

type Section = "beranda" | "match-aktif" | "jadwal";

const SIDEBAR_ITEMS = [
  { key: "beranda",     label: "Beranda",       icon: "🏠" },
  { key: "match-aktif", label: "Match Aktif",   icon: "⚡" },
  { key: "jadwal",      label: "Jadwal",        icon: "📅" },
];

export default function PanitiaPage() {
  const { user, isLoading, logout } = useRequireRole("PANITIA_LAPANGAN");
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
      case "beranda":     return <PanitiaHome />;
      case "match-aktif": return <MatchAktifSection />;
      case "jadwal":
        return (
          <JadwalPanitiaSection
            onStartAndSwitch={() => setSection("match-aktif")}
          />
        );
      default: return <PanitiaHome />;
    }
  }

  return (
    <DashboardLayout
      sidebarItems={SIDEBAR_ITEMS}
      activeSection={section}
      onSectionChange={(key) => setSection(key as Section)}
      roleBadge="Panitia Lapangan"
      roleColor="#66FFB4"
      username={user.username}
      onLogout={logout}
    >
      <div className="p-8">{renderSection()}</div>
    </DashboardLayout>
  );
}
