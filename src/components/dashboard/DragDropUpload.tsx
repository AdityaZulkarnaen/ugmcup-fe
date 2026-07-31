import { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/api/admin";

interface DragDropUploadProps {
  value: string;
  onChange: (url: string) => void;
  /**
   * Mode deferred: jika diberikan, file TIDAK langsung di-upload saat drop.
   * Komponen hanya menampilkan preview lokal (object URL) dan menyerahkan
   * File ke parent — parent yang meng-upload saat tombol Simpan diklik.
   */
  onFileSelect?: (file: File | null) => void;
  label?: string;
  className?: string;
  maxSizeMB?: number;
}

export function DragDropUpload({ value, onChange, onFileSelect, label = "Upload Gambar", className = "", maxSizeMB = 1 }: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError("");
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.match("image/(jpeg|png|webp)")) {
      setError("Format tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSizeMB}MB.`);
      return;
    }

    // Mode deferred: tampilkan preview lokal saja, upload dilakukan parent saat Simpan
    if (onFileSelect) {
      onFileSelect(file);
      onChange(URL.createObjectURL(file));
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengupload gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              if (value.startsWith("blob:")) URL.revokeObjectURL(value);
              onFileSelect?.(null);
              onChange("");
            }}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white transition-colors ${
            isDragging ? "border-[#6C47D1] bg-[#6C47D1]/5" : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleChange}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-[#6C47D1]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Mengupload...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <span className="text-xs">Drag & drop atau klik untuk memilih file</span>
              <span className="text-[10px] uppercase tracking-wide text-gray-400">
                JPG, PNG, WEBP (Maks {maxSizeMB}MB)
              </span>
            </div>
          )}
        </div>
      )}
      {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
    </div>
  );
}
