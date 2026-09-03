import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Presentational news card (t9): photo, gold category kicker, headline, a short
 * body preview, and a "Read more" affordance. The whole card links to the full
 * post. Reused by the homepage news section and the /news-media listing so both
 * stay visually identical. `image` may be a local path or a Blob URL (event
 * post) — next/image handles both (blob host is allow-listed in next.config).
 *
 * `body` and `cta` are optional so the card can also carry §9's standing Partners
 * entry, whose deck copy is a single sentence acting as the headline and whose
 * call to action is not "Read more". Posts pass both and are unaffected.
 */
export function NewsCard({
  href,
  image,
  kicker,
  title,
  body,
  cta = "Read more"
}: {
  href: string;
  image: string;
  kicker: string;
  title: string;
  body?: string;
  cta?: string;
}) {
  return (
    <Link href={href} className="card-dark card-link group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-astra-ink/85 via-astra-ink/10 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">{kicker}</p>
        <h3 className="mt-3 text-xl font-black leading-tight text-white">{title}</h3>
        {body ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-astra-white">{body}</p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
          {cta}
          <ArrowRight
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
