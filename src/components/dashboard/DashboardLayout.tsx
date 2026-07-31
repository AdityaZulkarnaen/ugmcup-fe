"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, type SidebarItem } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  roleBadge: string;
  username: string;
  onLogout: () => void;
  /** Title shown in the topbar — defaults to active section label */
  topbarTitle?: string;
}

export function DashboardLayout({
  children,
  sidebarItems,
  activeSection,
  onSectionChange,
  roleBadge,
  username,
  onLogout,
  topbarTitle,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const activeLabel =
    topbarTitle ??
    (sidebarItems.find((i) => i.key === activeSection)?.label ?? "Dashboard");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--dash-body-bg)" }}>
      <Sidebar
        items={sidebarItems}
        activeKey={activeSection}
        onSelect={onSectionChange}
        roleBadge={roleBadge}
        username={username}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex h-16 shrink-0 items-center justify-between px-6"
          style={{
            background: "var(--dash-topbar-bg)",
            borderBottom: "1px solid var(--dash-topbar-border)",
          }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--dash-text)" }}>
            {activeLabel}
          </h2>
        </header>

        {/* Content */}
        {/* data-lenis-prevent: lepaskan area ini dari Lenis (smooth scroll root)
            supaya wheel/touch men-scroll konten dashboard, bukan window. */}
        <main className="flex-1 overflow-y-auto" data-lenis-prevent>
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
