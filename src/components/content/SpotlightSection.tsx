import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { SpotlightCard } from "./SpotlightCard";

export async function SpotlightSection() {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (live.length === 0) return null;

  return (
    <section className="section-band band-deep border-y border-astra-gold/25">
      <div data-touchline-node className="container-wide">
        {live.length === 1 ? (
          <SpotlightCard event={live[0]} />
        ) : (
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {live.map((event) => (
              <div key={event.id} className="w-[min(100%,56rem)] shrink-0 snap-center">
                <SpotlightCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
