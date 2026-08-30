import { ArrowRight } from "lucide-react";
import { FlowReveal } from "@/src/components/FlowReveal";
import { CtaLink } from "@/src/components/CtaLink";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { listSummaries, partnersCard } from "@/src/lib/content/news";
import { NewsCard } from "./NewsCard";

/**
 * "Latest News & Match Reports" — Revised homepage architecture §9, "News from
 * the Training Ground & Partners". A homepage teaser showing the three most
 * recent posts. The newsletter signup that used to close this band now lives in
 * §10, where the deck puts it.
 *
 * The deck's two §9 entries are not extra blocks: the match report IS the first
 * card (the seed post carries its headline, and a real published report replaces
 * it), and Partners takes the third card slot. So the row is the two newest posts
 * plus a standing Partners card, rather than three posts with panels bolted
 * underneath.
 *
 * Posts come from the admin event-post system and fall back to the seed samples,
 * so the row is never short. Partners is fixed — it is an open invitation, not
 * something the club publishes — which is why it is appended rather than being
 * one more thing to keep current in /admin.
 */
export async function NewsSection() {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // two posts, because Partners holds the third slot
  const cards = listSummaries(live).slice(0, 2);

  return (
    <FlowReveal className="section-band band-deep" id="news">
      <div data-touchline-node className="container-wide">
        <h2 className="crest-type type-h2 text-white">
          Latest <span className="text-astra-red">News</span> &amp; Match Reports
        </h2>
        <p className="type-subhead mt-4 text-astra-gold">
          News from the Training Ground &amp; Partners
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
          {/* Partners takes the third slot. Same card shape as the posts, because
              in §9 it sits in the row rather than beside it — the deck folds
              partners INTO this band. Its photo is the kit-and-ball shot, which
              is also the /sponsors hero: the homepage card matching the hero of
              the page it opens is the pattern the rest of the site already uses.
              No body — the deck gives one sentence, and it reads as the headline. */}
          <NewsCard {...partnersCard} />
        </div>

        <div className="mt-7">
          <CtaLink href="/news-media" className="px-5 py-3 text-sm font-black uppercase tracking-wide">
            View all news
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
        </div>
      </div>
    </FlowReveal>
  );
}
