const PHRASE = ["Train", "Compete", "Repeat"];

/**
 * Full-bleed red marquee echoing the official brand ("TRAIN / COMPETE / REPEAT").
 * Decorative; the track is duplicated so the -50% scroll loops seamlessly.
 */
export function BrandMarquee() {
  const items = Array.from({ length: 6 }).flatMap(() => PHRASE);
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track py-3 text-sm font-black uppercase tracking-[0.2em] text-white sm:text-base">
        {[0, 1].map((dup) => (
          <span key={dup} className="flex shrink-0">
            {items.map((word, i) => (
              <span key={`${dup}-${i}`} className="flex items-center">
                {word}
                <span className="px-4 text-astra-gold">/</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
