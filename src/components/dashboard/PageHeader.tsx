import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black italic text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "#9D9DB6" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Tombol tambah data standar
export function AddButton({ onClick, label = "Tambah" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-[#14183B] transition hover:brightness-110"
      style={{ background: "linear-gradient(135deg, #66FFB4, #02F5D4)" }}
    >
      <span className="text-base leading-none">+</span>
      {label}
    </button>
  );
}

// Helper: Form input field untuk dipakai di dalam modal
interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "#9D9DB6" }}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

// Input standar dashboard
export function DashInput({
  placeholder,
  value,
  onChange,
  type = "text",
  required,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full rounded-xl border px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-500/60"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.12)",
      }}
    />
  );
}

// Select standar dashboard
export function DashSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-500/60"
      style={{
        background: "#1A1830",
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Textarea standar dashboard
export function DashTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-500/60 resize-none"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.12)",
      }}
    />
  );
}
