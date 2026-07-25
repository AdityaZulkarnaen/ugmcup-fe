"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import type { ReactNode } from "react";

export interface SidebarItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  roleBadge: string;
  roleColor: string;
  username: string;
  onLogout: () => void;
}

export function Sidebar({
  items,
  activeKey,
  onSelect,
  roleBadge,
  roleColor,
  username,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col overflow-hidden"
      style={{ background: "var(--dash-sidebar-bg)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <Image
          src="/images/global/logo.webp"
          alt="UGM Cup"
          width={1200}
          height={300}
          className="h-8 w-auto"
        />
      </div>

      {/* Role badge */}
      <div className="px-6 pt-4 pb-2">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: roleColor + "22", color: roleColor }}
        >
          {roleBadge}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1
                text-sm font-medium transition-all duration-200 text-left
                ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-[#9D9DB6] hover:text-white hover:bg-white/5"
                }
              `}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, #8352D9 0%, #6B3DB8 100%)",
                      boxShadow: "0 4px 24px rgba(131,82,217,0.35)",
                    }
                  : {}
              }
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #8352D9, #66FFB4)" }}
          >
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{username}</p>
            <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>
              {roleBadge}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition hover:border-red-400/40 hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
