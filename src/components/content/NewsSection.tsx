import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FlowReveal } from "@/src/components/FlowReveal";
import { CtaLink } from "@/src/components/CtaLink";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { listSummaries } from "@/src/lib/content/news";
import { NewsCard } from "./NewsCard";

/**
 * "Latest News & Match Reports" (Revised content spec §8, t9) — a homepage teaser
 * showing only the three most recent posts. Each card opens that post's own
 * subpage; "View All" goes to the full blog at /news-media. Driven by the admin
 * event-post system, falling back to the seed sample posts so it's never empty.
 */
export async function NewsSection() {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cards = listSummaries(live).slice(0, 3);

  return (
    <FlowReveal className="section-band band-deep" id="news">
      <div data-touchline-node className="container-wide">
        <h2 className="crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
          Latest <span className="text-astra-red">News</span> &amp; Match Reports
        </h2>
        <p className="mt-4 text-lg font-black uppercase tracking-[0.04em] text-astra-gold sm:text-xl">
          News from the training ground
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <NewsCard
              key={card.id}
              href={card.href}
              image={card.image}
              kicker={card.kicker}
              title={card.title}
              body={card.body}
            />
          ))}
        </div>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <CtaLink href="/news-media" className="px-5 py-3 text-sm font-black uppercase tracking-wide">
            View all news
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
          <span className="text-sm font-semibold text-white/55">Or sign up for the latest updates</span>
          <Link
            href="/news-media"
            className="btn btn-ghost border border-white/30 inline-flex items-center justify-center gap-2 rounded px-5 py-3 text-sm font-black uppercase tracking-wide text-white backdrop-blur"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </FlowReveal>
  );
}
