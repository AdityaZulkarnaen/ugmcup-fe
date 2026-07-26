"use client";

import { useEffect, useState } from "react";
import { Newspaper, Image as ImageIcon, HelpCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getNews, getMedia, getFaqs } from "@/lib/api/content";

export function MediaHome() {
  const [stats, setStats] = useState({ news: 0, media: 0, faqs: 0 });

  useEffect(() => {
    async function load() {
      const [n, m, f] = await Promise.allSettled([getNews(), getMedia(), getFaqs()]);
      setStats({
        news: n.status === "fulfilled" ? n.value.length : 0,
        media: m.status === "fulfilled" ? m.value.length : 0,
        faqs: f.status === "fulfilled" ? f.value.length : 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>Portal Konten Media</h2>
        <p className="mt-0.5 text-sm" style={{ color: "#6B7280" }}>Kelola konten publikasi UGM CUP 2026</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total Berita" value={stats.news} icon={<Newspaper size={20} />} />
        <StatCard label="Foto Galeri" value={stats.media} icon={<ImageIcon size={20} />} accentColor="#0284C7" />
        <StatCard label="FAQ" value={stats.faqs} icon={<HelpCircle size={20} />} accentColor="#059669" />
      </div>

      <div className="mt-6 rounded-lg border bg-white p-5" style={{ borderColor: "#E5E7EB" }}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "#111827" }}>Panduan Editor Konten</h3>
        <ul className="space-y-2 text-sm" style={{ color: "#6B7280" }}>
          <li className="flex items-start gap-2">
            <Newspaper size={15} className="mt-0.5 shrink-0" style={{ color: "#6C47D1" }} />
            <span><strong style={{ color: "#111827" }}>Berita</strong> &gt; Tulis artikel/berita untuk landing page.</span>
          </li>
          <li className="flex items-start gap-2">
            <ImageIcon size={15} className="mt-0.5 shrink-0" style={{ color: "#0284C7" }} />
            <span><strong style={{ color: "#111827" }}>Galeri</strong> &gt; Upload URL foto dokumentasi event per kategori.</span>
          </li>
          <li className="flex items-start gap-2">
            <HelpCircle size={15} className="mt-0.5 shrink-0" style={{ color: "#059669" }} />
            <span><strong style={{ color: "#111827" }}>FAQ</strong> &gt; Tambah/edit pertanyaan &amp; jawaban yang sering ditanyakan.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
