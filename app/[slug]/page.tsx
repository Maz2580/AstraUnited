import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { PageHero } from "@/src/components/blocks/PageHero";
import { BlockRenderer } from "@/src/components/blocks/BlockRenderer";
import { getPageBySlug, pages } from "@/src/lib/site-data";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { listSummaries } from "@/src/lib/content/news";
import { resolvePhoto, isSlotKey } from "@/src/lib/content/photo-slots";
import { NewsCard } from "@/src/components/content/NewsCard";

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getPageBySlug(params.slug);
  if (!page) return {};
  return { title: page.navLabel, description: page.intro };
}

export default async function MarketingPage({ params }: PageProps) {
  const page = getPageBySlug(params.slug);
  if (!page) notFound();

  const { photoOverrides, events } = await getClubContent();
  const heroKey = `hero-${page.slug}`;
  const heroOverride = isSlotKey(heroKey) ? resolvePhoto(heroKey, photoOverrides) : null;
  const heroOverrideSrc = heroOverride?.isOverride ? heroOverride.src : undefined;

  // On /news-media, the blog index: every live post (newest first) as a grid of
  // full articles — live admin posts, or the seed sample posts when none are
  // published. The homepage "View All" lands here.
  const newsPosts =
    page.slug === "news-media"
      ? listSummaries(
          events
            .filter((e) => isLive(e, new Date()))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        )
      : [];

  // BlockRenderer alternates fog/deep from fog at index 0, so the closing CTA
  // band must take the opposite of the last block to keep the alternation.
  const ctaBand = page.blocks.length % 2 === 0 ? "band-fog" : "band-deep";

  return (
    <main id="main-content" className="bg-astra-ink">
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} hero={page.hero} overrideSrc={heroOverrideSrc} />
      {newsPosts.length > 0 ? (
        <section className="section-band band-deep">
          <div className="container-wide">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-astra-red">From the training ground</p>
            <h2 className="crest-type mt-2 text-3xl leading-none text-white sm:text-4xl">Latest posts</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {newsPosts.map((post) => (
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
      {page.blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
      <section className={`section-band ${ctaBand}`}>
        <div className="container-wide flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-astra-gold">Next step</p>
            <h2 className="crest-type mt-2 text-4xl text-white">Talk to the club.</h2>
          </div>
          <CtaLink href="/contact" className="px-5 py-3 text-sm font-black uppercase tracking-normal">
            Contact Astra
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
        </div>
      </section>
    </main>
  );
}
