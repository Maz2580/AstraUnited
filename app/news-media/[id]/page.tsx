import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { getClubContent } from "@/src/lib/content/store";
import type { EventPost } from "@/src/lib/content/types";

type Props = { params: { id: string } };

// Defence in depth (mirrors SpotlightCard): only turn a ctaHref into a link if
// it is an http(s):// URL or a leading-slash relative path.
function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|\/(?!\/))/.test(href);
}

// Find by id across ALL posts (not just currently-live) so a direct link to a
// post outside its active window still opens — articles don't vanish from view.
async function getEvent(id: string): Promise<EventPost | null> {
  const { events } = await getClubContent();
  return events.find((e) => e.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.id);
  if (!event) return { title: "News | Astra United FC" };
  return {
    title: `${event.headline} | Astra United FC`,
    description: event.body.slice(0, 155)
  };
}

export default async function NewsPostPage({ params }: Props) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  const showCta = Boolean(event.ctaLabel && event.ctaHref && isSafeHref(event.ctaHref));

  return (
    <main id="main-content" className="bg-astra-ink">
      {/* Article hero */}
      <section className="relative">
        <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden">
          <Image src={event.image} alt={event.headline} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-astra-ink via-astra-ink/60 to-astra-ink/20" />
        </div>
        <div className="container-wide relative -mt-28 pb-2">
          <Link
            href="/news-media"
            className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-astra-gold"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All news
          </Link>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-astra-gold">Club News</p>
          <h1 className="crest-type mt-3 max-w-4xl text-4xl leading-[1.02] text-white sm:text-5xl">
            {event.headline}
          </h1>
        </div>
      </section>

      {/* Article body */}
      <section className="section-band band-deep">
        <div className="container-wide">
          <p className="max-w-3xl whitespace-pre-line text-lg leading-8 text-white/80">{event.body}</p>
          {showCta ? (
            <CtaLink href={event.ctaHref!} className="mt-9 px-5 py-3 text-sm font-black uppercase tracking-wide">
              {event.ctaLabel}
              <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
            </CtaLink>
          ) : null}
          <div className="mt-12 border-t border-white/10 pt-8">
            <Link
              href="/news-media"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-astra-red"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to all news
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
