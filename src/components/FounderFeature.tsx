import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { founder } from "@/src/lib/content/founder";

// Placeholder portrait until a dedicated founder photo is supplied.
const portrait = {
  src: "/images/community/astra-community-squad-portrait-1280.webp",
  alt: "Astra United FC youth team and coaching staff together on the grass at Darebin International Sports Centre",
  blurDataURL:
    "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwAgCdASoQAAsAA4BaJZgAD4/QgVa3okoIAAD+6FH54b9TP2X1kQqZHZuT8SgztvbFQZW3uate7ay7RQPqrySbaHq5o+c/w353zcCb2fk2+UOHp5V9+gAA"
};

export function FounderFeature() {
  return (
    <div
      data-touchline-react
      className="relative overflow-hidden rounded border border-white/12 bg-astra-ink text-white shadow-crest"
    >
      {/* Cinematic accents */}
      <div
        className="absolute inset-y-0 left-0 -z-0 w-2/5 skew-x-[-18deg] bg-astra-red/12 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-0 bg-gradient-to-br from-astra-navy/40 via-transparent to-astra-ink/80"
        aria-hidden="true"
      />

      <div className="relative z-[1] grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Portrait */}
        <figure className="relative">
          <div className="relative h-[360px] w-full lg:h-full lg:min-h-[560px]">
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              placeholder="blur"
              blurDataURL={portrait.blurDataURL}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-astra-ink via-astra-ink/20 to-transparent lg:bg-gradient-to-r"
              aria-hidden="true"
            />
          </div>
          <figcaption className="absolute bottom-4 left-5 right-5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-astra-gold">
            {founder.role}
          </figcaption>
        </figure>

        {/* Text */}
        <div className="p-7 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-astra-red" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-astra-gold">
              The vision behind Astra
            </span>
          </div>

          <h2 className="crest-type mt-5 text-4xl leading-[0.95] text-white sm:text-5xl">
            {founder.name}
          </h2>
          <p className="mt-3 text-base font-semibold text-white/80">{founder.role}</p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Credentials">
            {founder.titles.map((title) => (
              <li
                key={title}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide text-white/75"
              >
                {title}
              </li>
            ))}
          </ul>

          <figure className="mt-8 border-l-2 border-astra-gold pl-5">
            <Quote aria-hidden="true" className="mb-2 h-6 w-6 text-astra-red" />
            <blockquote className="crest-type text-2xl italic leading-tight text-astra-gold sm:text-3xl">
              {founder.pullQuote}
            </blockquote>
          </figure>

          <p className="mt-7 max-w-2xl text-base leading-7 text-white/75">{founder.summary}</p>

          <dl className="mt-8 grid gap-px overflow-hidden rounded border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {founder.honours.map((honour) => (
              <div key={honour} className="bg-astra-ink/40 px-4 py-4">
                <dd className="text-sm font-semibold leading-6 text-white/85">{honour}</dd>
              </div>
            ))}
          </dl>

          <CtaLink href="/the-club" className="mt-9 px-5 py-3 text-sm font-black uppercase tracking-wide">
            Read the full story
            <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
          </CtaLink>
        </div>
      </div>
    </div>
  );
}
