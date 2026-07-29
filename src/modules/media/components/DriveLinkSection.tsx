import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";

export function DriveLinkSection() {
  const [driveLink, setDriveLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDriveLink();
  }, []);

  async function fetchDriveLink() {
    try {
      const res = await apiRequest<{ key: string; value: string }>("/settings/DRIVE_LINK");
      if (res && res.value) {
        setDriveLink(res.value);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest("/admin/settings/DRIVE_LINK", {
        method: "PATCH",
        body: JSON.stringify({ value: driveLink }),
      });
      alert("Tautan Drive berhasil diperbarui.");
    } catch (e) {
      console.error(e);
      alert("Gagal memperbarui tautan Drive.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="text-[#8A8A93]">Memuat data...</div>;
  }

  return (
    <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E5E7EB" }}>
      <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Pengaturan Link Drive Dokumentasi</h2>
      <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
        Tautan ini akan digunakan pada tombol "Buka Google Drive" di halaman Dokumentasi.
      </p>

      <form onSubmit={handleSave} className="mt-6 flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "#374151" }}>URL Google Drive</label>
          <input
            type="url"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="rounded-lg border px-4 py-2.5 text-sm focus:outline-hidden"
            style={{
              borderColor: "#D1D5DB",
              backgroundColor: "#F9FAFB",
              color: "#111827"
            }}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isSaving}
          className="mt-2 w-fit bg-[#6C47D1] text-white hover:bg-[#5839b3]"
          variant="outline"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
}
