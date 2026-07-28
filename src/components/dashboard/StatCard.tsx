import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  /** accent color for border-left, default is --dash-accent */
  accentColor?: string;
}

export function StatCard({ label, value, sub, accentColor = "#6C47D1" }: StatCardProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
      style={{
        borderColor: "#E5E7EB",
        borderRightColor: accentColor,
        borderRightWidth: "2.5px",
        borderBottomColor: accentColor,
        borderBottomWidth: "3px",
      }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "#6B7280" }}>
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold" style={{ color: "#111827" }}>
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
