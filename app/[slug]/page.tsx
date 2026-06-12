import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { PageHero } from "@/src/components/blocks/PageHero";
import { BlockRenderer } from "@/src/components/blocks/BlockRenderer";
import { getPageBySlug, pages } from "@/src/lib/site-data";

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getPageBySlug(params.slug);
  if (!page) return {};
  return { title: page.navLabel, description: page.intro };
}

export default function MarketingPage({ params }: PageProps) {
  const page = getPageBySlug(params.slug);
  if (!page) notFound();

  // BlockRenderer alternates fog/deep from fog at index 0, so the closing CTA
  // band must take the opposite of the last block to keep the alternation.
  const ctaBand = page.blocks.length % 2 === 0 ? "band-fog" : "band-deep";

  return (
    <main id="main-content" className="bg-astra-ink">
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} hero={page.hero} />
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
