import Image from "next/image";
import type { NewsItem } from "@/lib/constants/news";

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <a href={item.href} className="flex flex-col text-left">
      <div className="relative aspect-35/36 w-full overflow-hidden rounded-2xl bg-neutral-200">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        {/* <span className="absolute left-3 top-3 rounded-xl bg-[#02F5D4] px-3 py-1 text-xs font-black text-[#8B5CF6]">
          {item.category}
        </span> */}
      </div>

      <p className="mt-4 text-xs text-[#6B6B73]">{item.date}</p>
      <h3 className="mt-2 text-lg font-black italic leading-snug text-[#0B0B0F]">
        {item.title}
      </h3>
    </a>
  );
}
