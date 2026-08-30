import { ArrowRight, Handshake, Newspaper } from "lucide-react";
import Link from "next/link";
import { FlowReveal } from "@/src/components/FlowReveal";
import { CtaLink } from "@/src/components/CtaLink";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { listSummaries } from "@/src/lib/content/news";
import { NewsCard } from "./NewsCard";
import { SubscribeBox } from "./SubscribeBox";

/**
 * "Latest News & Match Reports" — Revised homepage architecture §9, "News from
 * the Training Ground & Partners". A homepage teaser showing the three most
 * recent posts, then two highlight panels (the latest match report, and the
 * partner invitation the deck folds into this section), then the newsletter
 * Subscribe box.
 *
 * The cards are driven by the admin event-post system and fall back to the seed
 * sample posts, so the band is never empty. The match-report panel follows the
 * same source: it links to whatever the newest live post is rather than to a
 * hardcoded article, so it keeps pointing at the current report as the club
 * publishes. With nothing published it falls back to the blog index.
 */
export async function NewsSection() {
  const { events } = await getClubContent();
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cards = listSummaries(live).slice(0, 3);
  // the newest post, so the match-report panel tracks what the club publishes
  // instead of pointing at one frozen article
  const latestReportHref = cards[0]?.href ?? "/news-media";

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
        </div>

        {/* §9's two highlights. Kept as rows rather than a third and fourth card:
            they are not posts, and giving them the card shape would imply they
            belong to the feed above. */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e3258] to-[#0a1f38] p-5 ring-1 ring-white/10 transition duration-300 hover:ring-astra-gold/45">
            <div className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-astra-gold/10 ring-1 ring-astra-gold/25"
              >
                <Newspaper className="h-5 w-5 text-astra-gold" />
              </span>
              <div>
                <h3 className="crest-type type-h5 text-astra-gold">Latest Match Report</h3>
                <p className="type-body mt-1 italic text-white/78">
                  Senior Squad Secures Crucial Three Points in Local Football Thriller.
                </p>
                <Link
                  href={latestReportHref}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-astra-red"
                >
                  Read Full Report
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e3258] to-[#0a1f38] p-5 ring-1 ring-white/10 transition duration-300 hover:ring-astra-gold/45">
            <div className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-astra-gold/10 ring-1 ring-astra-gold/25"
              >
                <Handshake className="h-5 w-5 text-astra-gold" />
              </span>
              <div>
                <h3 className="crest-type type-h5 text-astra-gold">Our Partners</h3>
                <p className="type-body mt-1 text-white/78">
                  Astra United FC proudly welcomes local businesses dedicated to grassroots
                  development.
                </p>
                <Link
                  href="/sponsors"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-astra-red"
                >
                  View Platinum, Gold &amp; Silver Sponsorship Packages
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <CtaLink href="/news-media" className="px-5 py-3 text-sm font-black uppercase tracking-wide">
            View all news
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
        </div>

        {/* Compact newsletter signup bar, beneath the news cards. */}
        <div className="mt-6">
          <SubscribeBox />
        </div>
      </div>
    </FlowReveal>
  );
}
