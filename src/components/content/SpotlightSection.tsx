import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import type { Placement } from "@/src/lib/content/types";
import { SpotlightCard } from "./SpotlightCard";

// Renders the live event posts assigned to one placement slot. The homepage
// mounts this at several positions; each instance is absent when no live post
// targets its slot, so the page is unchanged when nothing is published.
export async function SpotlightSection({ placement = "top" }: { placement?: Placement }) {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()) && (e.placement ?? "top") === placement)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (live.length === 0) return null;

  return (
    <section className="section-band band-deep">
      <div data-touchline-node className="container-wide">
        {live.length === 1 ? (
          <SpotlightCard event={live[0]} />
        ) : (
          <div
            tabIndex={0}
            role="group"
            aria-label={`Club spotlight — ${live.length} posts, scroll for more`}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:thin]"
          >
            {live.map((event) => (
              <div key={event.id} className="w-[min(100%,56rem)] shrink-0 snap-start">
                <SpotlightCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
