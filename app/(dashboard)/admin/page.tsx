"use client";

import { useState } from "react";
import {
  LayoutDashboard, Building2, Users, UserCheck,
  Calendar, GitBranch, BarChart2, ClipboardList,
} from "lucide-react";
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
import { MatchAktifSection } from "@/modules/admin/components/MatchAktifSection";
import { Zap } from "lucide-react";

type Section =
  | "beranda" | "institusi" | "atlet" | "peserta"
  | "jadwal" | "match-aktif" | "bracket" | "grup" | "audit-log";

const SIDEBAR_ITEMS = [
  { key: "beranda",   label: "Beranda",           icon: <LayoutDashboard size={16} /> },
  { key: "institusi", label: "Institusi",          icon: <Building2 size={16} /> },
  { key: "atlet",     label: "Atlet",              icon: <Users size={16} /> },
  { key: "peserta",   label: "Peserta & Tim",      icon: <UserCheck size={16} /> },
  { key: "grup",      label: "Grup & Klasemen",    icon: <BarChart2 size={16} /> },
  { key: "bracket",   label: "Bracket",            icon: <GitBranch size={16} /> },
  { key: "jadwal",    label: "Jadwal",             icon: <Calendar size={16} /> },
  { key: "match-aktif", label: "Match Aktif",      icon: <Zap size={16} /> },
  { key: "audit-log", label: "Audit Log",          icon: <ClipboardList size={16} /> },
];

export default function AdminPage() {
  const { user, isLoading, logout } = useRequireRole("SUPER_ADMIN");
  const [section, setSection] = useState<Section>("beranda");

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "var(--dash-body-bg)" }}>
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: "#6C47D1" }} />
      </div>
    );
  }

  function renderSection() {
    switch (section) {
      case "beranda":   return <AdminHome />;
      case "institusi": return <InstitusiSection />;
      case "atlet":     return <AtletSection />;
      case "peserta":   return <PesertaSection />;
      case "jadwal":    return <JadwalSection onStartAndSwitch={() => setSection("match-aktif")} />;
      case "match-aktif": return <MatchAktifSection />;
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
      roleBadge="Admin"
      username={user.username}
      onLogout={logout}
    >
      <div className="p-6">{renderSection()}</div>
    </DashboardLayout>
  );
}
