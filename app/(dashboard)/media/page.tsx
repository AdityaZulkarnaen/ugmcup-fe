"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import { MediaHome } from "@/modules/media/components/MediaHome";
import { BeritaSection } from "@/modules/media/components/BeritaSection";
import { GaleriSection } from "@/modules/media/components/GaleriSection";
import { FaqSection } from "@/modules/media/components/FaqSection";

type Section = "beranda" | "berita" | "galeri" | "faq";

const SIDEBAR_ITEMS = [
  { key: "beranda", label: "Beranda",   icon: "🏠" },
  { key: "berita",  label: "Berita",    icon: "📰" },
  { key: "galeri",  label: "Galeri",    icon: "🖼️" },
  { key: "faq",     label: "FAQ",       icon: "❓" },
];

export default function MediaPage() {
  const { user, isLoading, logout } = useRequireRole("EDITOR_KONTEN");
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
      case "beranda": return <MediaHome />;
      case "berita":  return <BeritaSection />;
      case "galeri":  return <GaleriSection />;
      case "faq":     return <FaqSection />;
      default:        return <MediaHome />;
    }
  }

  return (
    <DashboardLayout
      sidebarItems={SIDEBAR_ITEMS}
      activeSection={section}
      onSectionChange={(key) => setSection(key as Section)}
      roleBadge="Editor Konten"
      roleColor="#66FFB4"
      username={user.username}
      onLogout={logout}
    >
      <div className="p-8">{renderSection()}</div>
    </DashboardLayout>
  );
}
