import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/src/components/SectionHeader";
import { getPageBySlug, pages } from "@/src/lib/site-data";

type PageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getPageBySlug(params.slug);

  if (!page) {
    return {};
  }

  return {
    title: page.navLabel,
    description: page.intro
  };
}

export default function MarketingPage({ params }: PageProps) {
  const page = getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main id="main-content" className="bg-astra-white pt-20">
      <section className="field-grid px-5 py-24 text-white sm:py-32">
        <div className="container-wide">
          <p className="mb-4 text-sm font-black uppercase tracking-normal text-astra-gold">{page.eyebrow}</p>
          <h1 className="crest-type max-w-5xl text-5xl leading-[0.9] sm:text-7xl">{page.title}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/76">{page.intro}</p>
        </div>
      </section>
      <section className="section-band bg-white">
        <div className="container-wide">
          <SectionHeader eyebrow={page.navLabel} title="Page structure" copy="These sections mirror the consultancy sitemap and copy deck, ready for final client-specific names, links, forms, and documents." />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {page.sections.map((section) => (
              <article key={section.title} className="card-plain p-6 sm:p-8">
                <h2 className="text-2xl font-black text-astra-ink">{section.title}</h2>
                <p className="mt-4 text-base leading-7 text-slate-700">{section.copy}</p>
                {section.bullets ? (
                  <ul className="mt-6 grid gap-3">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-astra-red" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-band bg-astra-ink text-white">
        <div className="container-wide flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-astra-gold">Next step</p>
            <h2 className="crest-type mt-2 text-4xl">Talk to the club.</h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-red-700"
          >
            Contact Astra
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
