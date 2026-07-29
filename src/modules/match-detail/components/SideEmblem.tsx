import Image from "next/image";
import { participants, sideName } from "@/lib/constants/matches";

const sizes = {
  lg: { box: "h-14 w-14 rounded-2xl", image: 56, mark: "text-lg" },
  sm: { box: "h-5 w-5 rounded-md", image: 20, mark: "text-[10px]" },
} as const;

/**
 * Badge for a match side: the image registered for that athlete, or a neutral
 * placeholder while none has been uploaded. Sides are matched by name because
 * live and scheduled matches store names rather than participant ids.
 */
export function SideEmblem({
  players,
  size = "sm",
}: {
  players: string[];
  size?: keyof typeof sizes;
}) {
  const name = sideName(players);
  const registered = participants.find(
    (participant) => sideName(participant.players) === name,
  );
  const { box, image, mark } = sizes[size];

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.04] ${box}`}
    >
      {registered?.avatar ? (
        <Image
          src={registered.avatar}
          alt=""
          width={image}
          height={image}
          unoptimized
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          aria-hidden
          className={`font-bold leading-none text-[#8A8A93] ${mark}`}
        >
          ?
        </span>
      )}
    </span>
  );
}
