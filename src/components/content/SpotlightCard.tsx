import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import type { EventPost } from "@/src/lib/content/types";

// Defence in depth: the schema already rejects unsafe ctaHref at parse time,
// but the admin live-preview renders SpotlightCard with un-validated, mid-typing
// input — so only render the CTA for http(s):// or leading-slash relative hrefs.
function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|\/(?!\/))/.test(href);
}

export function SpotlightCard({ event, unoptimized = false }: { event: EventPost; unoptimized?: boolean }) {
  const showCta = Boolean(event.ctaLabel && event.ctaHref && isSafeHref(event.ctaHref));
  return (
    <article className="card-dark grid overflow-hidden md:grid-cols-[1fr_1.1fr]">
      <div className="relative min-h-[260px]">
        {unoptimized ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt={event.headline} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Image src={event.image} alt={event.headline} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        )}
      </div>
      <div className="p-7 sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">Club spotlight</p>
        <h3 className="crest-type mt-3 text-3xl leading-none text-white sm:text-4xl">{event.headline}</h3>
        <p className="mt-4 text-sm leading-6 text-white/72">{event.body}</p>
        {showCta ? (
          <CtaLink href={event.ctaHref!} className="mt-7 px-5 py-3 text-sm font-black uppercase tracking-wide">
            {event.ctaLabel}
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
        ) : null}
      </div>
    </article>
  );
}
