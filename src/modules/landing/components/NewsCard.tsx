import Image from "next/image";
import type { News } from "@/lib/types";

interface NewsCardProps {
  item: News;
}

export function NewsCard({ item }: NewsCardProps) {
  const href = item.url || "#";
  const image = item.coverImage || "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80";
  const date = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "";

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col text-left">
      <div className="relative aspect-35/36 w-full overflow-hidden rounded-2xl bg-neutral-200">
        <Image
          src={image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <span className="absolute left-3 top-3 rounded-xl bg-[#02F5D4] px-3 py-1 text-xs font-black text-[#8B5CF6]">
          INFO
        </span>
      </div>

      <p className="mt-4 text-xs text-[#6B6B73]">{date}</p>
      <h3 className="mt-2 text-lg font-black italic leading-snug text-[#0B0B0F]">
        {item.title}
      </h3>
    </a>
  );
}
