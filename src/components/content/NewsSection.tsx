import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FlowReveal } from "@/src/components/FlowReveal";
import { CtaLink } from "@/src/components/CtaLink";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { newsPreview } from "@/src/lib/site-data";
import { NewsCard } from "./NewsCard";

// Static fallback imagery for when no event posts are published yet, so the
// section is never empty pre-launch. Real posts (with their own images) take
// over automatically once published in the admin.
const FALLBACK_IMAGES = [
  "/images/community/astra-community-team-photo-1280.webp",
  "/images/academy/astra-academy-youth-training-1280.webp",
  "/images/academy/astra-academy-coaching-huddle-1280.webp"
];

type Card = { href: string; image: string; kicker: string; title: string; body: string };

/**
 * "Latest News & Match Reports" (Revised content spec §8, t9). Driven by the
 * admin event-post system: the three most recent LIVE posts render as cards that
 * link to their full article at /news-media/[id]. With no posts published yet it
 * falls back to the static newsPreview so the homepage always looks complete.
 */
export async function NewsSection() {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const cards: Card[] =
    live.length > 0
      ? live.map((e) => ({
          href: `/news-media/${e.id}`,
          image: e.image,
          kicker: "Club News",
          title: e.headline,
          body: e.body
        }))
      : newsPreview.slice(0, 3).map((n, i) => ({
          href: "/news-media",
          image: FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
          kicker: n.kicker,
          title: n.title,
          body: n.copy
        }));

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
            <NewsCard key={card.href + card.title} {...card} />
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
