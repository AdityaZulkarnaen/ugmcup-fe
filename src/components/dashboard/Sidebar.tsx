"use client";

import { useState } from "react";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

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
  username: string;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  items,
  activeKey,
  onSelect,
  roleBadge,
  username,
  onLogout,
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className="relative flex h-screen flex-col transition-all duration-300"
      style={{
        width: collapsed ? "64px" : "224px",
        background: "linear-gradient(180deg, #1A162B 0%, #0F0E1A 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-4 py-5"
        style={{ minHeight: "64px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {collapsed ? (
          <Image
            src="/images/global/logo-icon.svg"
            alt="UGM Cup"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        ) : (
          <Image
            src="/images/global/logo.webp"
            alt="UGM Cup"
            width={400}
            height={100}
            className="h-7 w-auto"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" data-lenis-prevent>
        {items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={collapsed ? item.label : undefined}
              className="group mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-150"
              style={
                isActive
                  ? {
                    background: "#6C47D1",
                    color: "#FFFFFF",
                  }
                  : {
                    color: "#94A3B8",
                    background: "transparent",
                  }
              }
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} className="p-2">
        {!collapsed && (
          <div className="flex items-start px-3 py-2 mb-1">
            <span className="truncate text-xs font-medium" style={{ color: "#CBD5E1" }}>
              {username}
            </span>
          </div>
        )}
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          style={{ color: "#64748B" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#F87171";
            (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#64748B";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span className="text-xs font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] z-[999] flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors"
        style={{ background: "#1A162B", border: "1px solid rgba(255,255,255,0.15)", color: "#94A3B8" }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
