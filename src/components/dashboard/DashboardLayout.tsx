"use client";

import type { ReactNode } from "react";
import { Sidebar, type SidebarItem } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  roleBadge: string;
  roleColor: string;
  username: string;
  onLogout: () => void;
}

export function DashboardLayout({
  children,
  sidebarItems,
  activeSection,
  onSectionChange,
  roleBadge,
  roleColor,
  username,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--dash-body-bg)" }}
    >
      <Sidebar
        items={sidebarItems}
        activeKey={activeSection}
        onSelect={onSectionChange}
        roleBadge={roleBadge}
        roleColor={roleColor}
        username={username}
        onLogout={onLogout}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
