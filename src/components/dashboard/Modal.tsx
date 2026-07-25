"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
  // Tutup modal dengan Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeMap[size]} rounded-2xl border shadow-2xl`}
        style={{
          background: "linear-gradient(135deg, #1A1830 0%, #14183B 100%)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Tombol-tombol standar untuk footer modal
export function ModalCancelButton({ onClick, label = "Batal" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border px-5 py-2 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
      style={{ borderColor: "rgba(255,255,255,0.12)" }}
    >
      {label}
    </button>
  );
}

export function ModalSubmitButton({
  onClick,
  label = "Simpan",
  isLoading = false,
  type = "button",
}: {
  onClick?: () => void;
  label?: string;
  isLoading?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className="rounded-xl px-5 py-2 text-sm font-bold text-[#14183B] transition hover:brightness-110 disabled:opacity-50"
      style={{ background: "linear-gradient(135deg, #66FFB4, #02F5D4)" }}
    >
      {isLoading ? "Menyimpan..." : label}
    </button>
  );
}
