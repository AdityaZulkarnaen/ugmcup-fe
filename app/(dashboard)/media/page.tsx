"use client";

import { useState } from "react";
import { LayoutDashboard, Newspaper, Image as ImageIcon, HelpCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useRequireRole } from "@/lib/hooks/useAuth";
import { MediaHome } from "@/modules/media/components/MediaHome";
import { BeritaSection } from "@/modules/media/components/BeritaSection";
import { GaleriSection } from "@/modules/media/components/GaleriSection";
import { FaqSection } from "@/modules/media/components/FaqSection";
import { DriveLinkSection } from "@/modules/media/components/DriveLinkSection";

type Section = "beranda" | "berita" | "galeri" | "drive";

const SIDEBAR_ITEMS = [
  { key: "beranda", label: "Beranda", icon: <LayoutDashboard size={16} /> },
  { key: "berita",  label: "Berita",  icon: <Newspaper size={16} /> },
  { key: "galeri",  label: "Galeri",  icon: <ImageIcon size={16} /> },
  { key: "drive",   label: "Drive",   icon: <HelpCircle size={16} /> }, // Menggunakan icon HelpCircle sementara, bisa diganti LinkIcon
];

export default function MediaPage() {
  const { user, isLoading, logout } = useRequireRole("EDITOR_KONTEN");
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
      case "beranda": return <MediaHome />;
      case "berita":  return <BeritaSection />;
      case "galeri":  return <GaleriSection />;
      case "drive":   return <DriveLinkSection />;
      default:        return <MediaHome />;
    }
  }

  return (
    <DashboardLayout
      sidebarItems={SIDEBAR_ITEMS}
      activeSection={section}
      onSectionChange={(key) => setSection(key as Section)}
      roleBadge="Media"
      username={user.username}
      onLogout={logout}
    >
      <div className="p-6">{renderSection()}</div>
    </DashboardLayout>
  );
}
