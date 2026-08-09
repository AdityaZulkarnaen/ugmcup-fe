import type { ReactNode } from "react";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#111827" }}>{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm" style={{ color: "#6B7280" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function AddButton({ onClick, label = "Tambah" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      style={{ background: "#6C47D1" }}
    >
      <Plus size={15} />
      {label}
    </button>
  );
}

interface FormFieldProps {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider" style={{ color: "#374151" }}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

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
  const isPickerType = ["date", "datetime-local", "time", "month", "week"].includes(type);
  const isNumberType = type === "number";
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={
        isPickerType
          ? (e) => {
              const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
              try {
                el.showPicker?.();
              } catch {
                // beberapa browser bisa melempar jika picker sudah terbuka — abaikan
              }
            }
          : undefined
      }
      required={required}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100 ${
        isNumberType
          ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          : ""
      }`}
      style={{
        borderColor: "#D1D5DB",
        color: "#111827",
        backgroundColor: "#F9FAFB",
        colorScheme: "light",
      }}
    />
  );
}

export function DashSelect({
  value,
  onChange,
  options,
  groups,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; label: string }[];
  groups?: { label: string; options: { value: string; label: string }[] }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
      style={{
        borderColor: "#D1D5DB",
        color: "#111827",
        backgroundColor: "#F9FAFB",
        colorScheme: "light",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options &&
        options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      {groups &&
        groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
    </select>
  );
}

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
      className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
      style={{
        borderColor: "#D1D5DB",
        color: "#111827",
        backgroundColor: "#F9FAFB",
        colorScheme: "light",
      }}
    />
  );
}
