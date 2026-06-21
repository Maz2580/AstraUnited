import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { NewsCard } from "@/src/components/content/NewsCard";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { findArticle, listSummaries } from "@/src/lib/content/news";

type Props = { params: { id: string } };

// Defence in depth (mirrors SpotlightCard): only turn a ctaHref into a link if
// it is an http(s):// URL or a leading-slash relative path.
function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|\/(?!\/))/.test(href);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { events } = await getClubContent();
  const article = findArticle(params.id, events);
  if (!article) return { title: "News" };
  return {
    title: article.title,
    description: article.body.slice(0, 155)
  };
}

export default async function NewsPostPage({ params }: Props) {
  const { events } = await getClubContent();
  const article = findArticle(params.id, events);
  if (!article) notFound();

  const showCta = Boolean(article.ctaLabel && article.ctaHref && isSafeHref(article.ctaHref));
  const paragraphs = article.body.split(/\n\n+/).filter(Boolean);

  // "More news" — other live posts (or seed posts), excluding the current one.
  const live = events
    .filter((e) => isLive(e, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const more = listSummaries(live)
    .filter((p) => p.id !== article.id)
    .slice(0, 3);

  return (
    <main id="main-content" className="bg-astra-ink">
      <article>
        {/* Article header */}
        <section className="section-band band-deep pb-0">
          <div className="container-wide">
            <Link
              href="/news-media"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-astra-gold transition hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> All news
            </Link>
            <div className="mx-auto mt-8 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.16em]">
                <span className="rounded-full bg-astra-red/15 px-3 py-1 text-astra-red">{article.category}</span>
                {article.dateLabel ? <span className="text-white/50">{article.dateLabel}</span> : null}
              </div>
              <h1 className="crest-type mt-4 text-4xl leading-[1.04] text-white sm:text-5xl">{article.title}</h1>
            </div>
          </div>
        </section>

        {/* Hero image */}
        <div className="container-wide pt-10">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl ring-1 ring-white/10">
            <div className="relative aspect-[16/9] w-full">
              <Image src={article.image} alt={article.title} fill priority sizes="(min-width: 1024px) 56rem, 100vw" className="object-cover" />
            </div>
          </div>
        </div>

        {/* Article body */}
        <section className="section-band band-deep pt-10">
          <div className="container-wide">
            <div className="mx-auto max-w-3xl space-y-6">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-lg leading-8 text-white/80">
                  {para}
                </p>
              ))}
              {showCta ? (
                <CtaLink href={article.ctaHref!} className="mt-2 px-5 py-3 text-sm font-black uppercase tracking-wide">
                  {article.ctaLabel}
                  <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
                </CtaLink>
              ) : null}
              <div className="border-t border-white/10 pt-8">
                <Link
                  href="/news-media"
                  className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-astra-red transition hover:translate-x-0.5"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to all news
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* More news */}
      {more.length > 0 ? (
        <section className="section-band band-fog">
          <div className="container-wide">
            <h2 className="crest-type text-3xl leading-none text-white sm:text-4xl">More from the club</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((post) => (
                <NewsCard
                  key={post.id}
                  href={post.href}
                  image={post.image}
                  kicker={post.kicker}
                  title={post.title}
                  body={post.body}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
