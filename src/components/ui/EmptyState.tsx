interface EmptyStateProps {
  /** Judul singkat, mis. "Bagan bracket belum tersedia". */
  title: string;
  /** Kalimat penjelas opsional di bawah judul. */
  description?: string;
  isLight?: boolean;
  className?: string;
}

/**
 * Placeholder seragam untuk panel tanpa data — kotak dashed dengan judul tebal
 * dan keterangan kecil. Dipakai di seluruh tab halaman Pertandingan.
 */
export function EmptyState({
  title,
  description,
  isLight = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center text-sm ${
        isLight
          ? "border-[rgba(0,0,0,0.12)] bg-[rgba(0,0,0,0.01)] text-[rgba(26,22,43,0.5)]"
          : "border-white/10 bg-white/[0.01] text-[#7A7A83]"
      } ${className}`}
    >
      <p className={`font-semibold ${isLight ? "text-[#1a162b]" : "text-white"}`}>
        {title}
      </p>
      {description ? (
        <p
          className={`mt-1 text-xs ${
            isLight ? "text-[rgba(26,22,43,0.4)]" : "text-[#6B6B73]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
