import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Placeholders shaped like the real rows they stand in for, so the panel does
 * not jump when the data lands. Each takes the same `isLight` as its live
 * counterpart, and a `delay` that walks the shimmer down the list.
 */

/** Card shell shared with `LiveScoreCard`, so the swap is seamless. */
function cardShell(isLight: boolean) {
  return isLight
    ? "border-[rgba(0,0,0,0.08)] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.04)]"
    : "border-white/[0.06] bg-white/[0.02] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]";
}

interface SkeletonRowProps {
  isLight?: boolean;
  delay?: number;
}

/** Mirrors `LiveScoreCard`: status row, two names flanking a big score, footer. */
export function LiveScoreCardSkeleton({ isLight = false, delay = 0 }: SkeletonRowProps) {
  const block = { isLight, delay };

  return (
    <div className={`rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 ${cardShell(isLight)}`}>
      {/* Status + court */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton {...block} className="h-3 w-10 rounded-full" />
          <Skeleton {...block} className="h-5 w-28 rounded-full" />
        </div>
        <Skeleton {...block} className="h-3 w-20 rounded-full" />
      </div>

      {/* Names either side of the score */}
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton {...block} className="h-4 w-32 rounded-md" />
          <Skeleton {...block} className="h-3 w-20 rounded-md" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <Skeleton {...block} className="h-9 w-24 rounded-lg sm:h-11 sm:w-28" />
          <div className="flex items-center gap-1.5">
            <Skeleton {...block} className="h-4 w-7 rounded-md" />
            <Skeleton {...block} className="h-4 w-7 rounded-md" />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Skeleton {...block} className="h-4 w-32 rounded-md" />
          <Skeleton {...block} className="h-3 w-20 rounded-md" />
        </div>
      </div>

      {/* Footer affordance */}
      <div
        className={`mt-4 flex justify-end border-t pt-3 ${
          isLight ? "border-[rgba(0,0,0,0.06)]" : "border-white/[0.06]"
        }`}
      >
        <Skeleton {...block} className="h-3 w-32 rounded-full" />
      </div>
    </div>
  );
}

/** Mirrors `ScheduleRow`: time, meta pills, the two names, status pill. */
export function ScheduleRowSkeleton({ isLight = false, delay = 0 }: SkeletonRowProps) {
  const block = { isLight, delay };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border py-3 pl-4 pr-3 sm:gap-4 sm:py-3.5 sm:pl-6 sm:pr-4 ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-white"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <Skeleton {...block} className="hidden h-4 w-10 shrink-0 rounded-md sm:block" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton {...block} className="h-4 w-20 rounded-full" />
          <Skeleton {...block} className="h-3 w-12 rounded-full" />
          <Skeleton {...block} className="h-3 w-16 rounded-full" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Skeleton {...block} className="h-4 w-28 rounded-md sm:w-36" />
          <Skeleton {...block} className="hidden h-4 w-28 rounded-md sm:block sm:w-36" />
        </div>
      </div>

      <Skeleton {...block} className="h-5 w-20 shrink-0 rounded-full" />
    </div>
  );
}

/**
 * Placeholder for a row of `FilterSelect` pills. The options are derived from
 * the fetched matches, so the real filters cannot render yet — without this the
 * list would shunt downwards the moment they appear.
 */
export function FilterBarSkeleton({
  count = 3,
  isLight = false,
}: SkeletonRowProps & { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:flex">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          isLight={isLight}
          delay={i * 120}
          className={`h-9 min-w-0 flex-1 rounded-full sm:max-w-56 ${
            i === count - 1 && count % 2 === 1 ? "col-span-2 sm:col-span-1" : ""
          }`}
        />
      ))}
    </div>
  );
}

/** Mirrors a `GroupTable`: caption bar over a handful of standings rows. */
export function StandingsGroupSkeleton({ isLight = false, delay = 0 }: SkeletonRowProps) {
  const block = { isLight, delay };

  return (
    <section
      className={`overflow-hidden rounded-xl border ${
        isLight ? "border-[rgba(0,0,0,0.08)] bg-white" : "border-white/[0.06]"
      }`}
    >
      <div
        className={`border-b px-4 py-2.5 ${
          isLight
            ? "border-[rgba(0,0,0,0.06)] bg-[rgba(0,0,0,0.02)]"
            : "border-white/[0.06] bg-white/[0.03]"
        }`}
      >
        <Skeleton {...block} className="h-3 w-24 rounded-full" />
      </div>

      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className={`flex items-center gap-3 border-t px-4 py-3 ${
            isLight ? "border-[rgba(0,0,0,0.05)]" : "border-white/[0.04]"
          }`}
        >
          <Skeleton {...block} delay={delay + row * 90} className="h-4 w-4 shrink-0 rounded-md" />
          <Skeleton
            {...block}
            delay={delay + row * 90}
            className="h-8 w-8 shrink-0 rounded-full"
          />
          <Skeleton {...block} delay={delay + row * 90} className="h-4 flex-1 rounded-md" />
          <div className="hidden items-center gap-2 sm:flex">
            {[0, 1, 2].map((cell) => (
              <Skeleton
                key={cell}
                {...block}
                delay={delay + row * 90}
                className="h-4 w-6 rounded-md"
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/** Mirrors the bracket board: rounds narrowing left to right. */
export function BracketBoardSkeleton({ isLight = false }: SkeletonRowProps) {
  // Four, two, one — the shape of a draw, so the wait previews the result.
  const rounds = [4, 2, 1];

  return (
    <div
      className={`overflow-hidden rounded-2xl border p-6 ${
        isLight
          ? "border-[rgba(0,0,0,0.08)] bg-white shadow-sm"
          : "border-white/[0.06] bg-white/[0.02] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]"
      }`}
    >
      <Skeleton isLight={isLight} className="mb-5 h-3 w-40 rounded-full" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {rounds.map((count, column) => (
          <div
            key={column}
            className={`flex flex-col justify-around gap-3 ${
              column === 2 ? "col-span-2 lg:col-span-1" : ""
            }`}
          >
            <Skeleton
              isLight={isLight}
              delay={column * 160}
              className="h-2.5 w-16 rounded-full"
            />
            {Array.from({ length: count }).map((_, card) => (
              <div
                key={card}
                className={`overflow-hidden rounded-xl border ${
                  isLight
                    ? "border-[rgba(0,0,0,0.08)] bg-white"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {[0, 1].map((side) => (
                  <div
                    key={side}
                    className={`flex items-center gap-2 px-3.5 py-2 ${
                      side === 1
                        ? isLight
                          ? "border-t border-[rgba(0,0,0,0.05)]"
                          : "border-t border-white/[0.04]"
                        : ""
                    }`}
                  >
                    <Skeleton
                      isLight={isLight}
                      delay={column * 160 + card * 80}
                      className="h-4 w-4 shrink-0 rounded-full"
                    />
                    <Skeleton
                      isLight={isLight}
                      delay={column * 160 + card * 80}
                      className="h-3 flex-1 rounded-md"
                    />
                    <Skeleton
                      isLight={isLight}
                      delay={column * 160 + card * 80}
                      className="h-3 w-3 shrink-0 rounded-md"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
