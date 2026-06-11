import Image from "next/image";
import { Reveal } from "@/src/components/Reveal";
import type { PageHero as PageHeroData } from "@/src/lib/site-data";

type Props = { eyebrow: string; title: string; intro: string; hero: PageHeroData };

export function PageHero({ eyebrow, title, intro, hero }: Props) {
  return (
    <section className="relative isolate flex min-h-[60svh] items-end overflow-hidden px-5 pb-16 pt-32 text-white">
      <Image
        src={hero.src}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={hero.blurDataURL}
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-astra-ink via-astra-ink/80 to-astra-ink/55" aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 -z-10 w-2/5 skew-x-[-18deg] bg-astra-red/15 blur-2xl" aria-hidden="true" />
      <Reveal className="container-wide">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-astra-red" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-astra-gold">{eyebrow}</span>
        </div>
        <h1 className="crest-type mt-5 max-w-5xl text-5xl leading-[0.9] sm:text-7xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">{intro}</p>
      </Reveal>
    </section>
  );
}
