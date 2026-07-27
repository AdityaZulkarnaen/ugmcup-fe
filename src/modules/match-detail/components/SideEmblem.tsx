import Image from "next/image";
import { participants, sideName } from "@/lib/constants/matches";

/**
 * Badge for a match side: the image registered for that athlete, falling back
 * to the gold shuttlecock mark. Sides are matched by name because live and
 * scheduled matches store names rather than participant ids.
 */
const FALLBACK_EMBLEM = "/images/global/Logo icon.svg";

const sizes = {
  lg: { box: "h-14 w-14 rounded-2xl", image: 40 },
  sm: { box: "h-5 w-5 rounded-md", image: 20 },
} as const;

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
  const { box, image } = sizes[size];

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/[0.04] ${box}`}
    >
      <Image
        src={registered?.avatar ?? FALLBACK_EMBLEM}
        alt=""
        width={image}
        height={image}
        className="h-full w-full object-contain p-1"
      />
    </span>
  );
}
