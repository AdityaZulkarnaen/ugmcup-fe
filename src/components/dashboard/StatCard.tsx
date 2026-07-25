import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent?: "mint" | "violet" | "default";
  sub?: string;
}

export function StatCard({ label, value, icon, accent = "default", sub }: StatCardProps) {
  const accentStyle =
    accent === "mint"
      ? { borderColor: "rgba(102,255,180,0.3)", color: "#66FFB4" }
      : accent === "violet"
        ? { borderColor: "rgba(131,82,217,0.3)", color: "#8352D9" }
        : { borderColor: "rgba(255,255,255,0.08)", color: "#9D9DB6" };

  return (
    <div
      className="rounded-2xl border p-6 transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: "var(--dash-card-bg)",
        borderColor: accentStyle.borderColor,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "#9D9DB6" }}>
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {sub && (
            <p className="mt-1 text-xs" style={{ color: "#9D9DB6" }}>
              {sub}
            </p>
          )}
        </div>
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
          style={{
            background: accentStyle.borderColor,
          }}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
