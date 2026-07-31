"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

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
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeMap[size]} rounded-xl border bg-white shadow-xl`}
        style={{ borderColor: "#E5E7EB" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#F3F4F6" }}>
          <h3 className="text-base font-bold" style={{ color: "#111827" }}>{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: "#6B7280" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {/* data-lenis-prevent: biarkan isi form/modal di-scroll wheel secara native,
            tanpa direbut oleh Lenis (smooth scroll root). */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5" data-lenis-prevent>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 border-t px-6 py-4" style={{ borderColor: "#F3F4F6" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalCancelButton({ onClick, label = "Batal" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-5 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
      style={{ borderColor: "#D1D5DB", color: "#374151" }}
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
      className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      style={{ background: "#6C47D1" }}
    >
      {isLoading ? "Menyimpan..." : label}
    </button>
  );
}
