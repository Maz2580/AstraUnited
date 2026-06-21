"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * "Trusted by" logo wall for the sponsorship section (t8). A slow, seamless
 * marquee of partner wordmarks across the purple pill — enough motion to draw
 * the eye and read as social proof, slow enough not to distract. Reduced-motion
 * falls back to a centred static row. Partner names are passed in so the slots
 * can be swapped for real sponsor logos later.
 */
function PartnerMark({ name }: { name: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-7">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25"
      >
        {name.charAt(0)}
      </span>
      <span className="whitespace-nowrap text-sm font-black uppercase tracking-[0.16em] text-white/85">
        {name}
      </span>
    </div>
  );
}

export function SponsorMarquee({ partners }: { partners: string[] }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-center gap-y-3">
        {partners.map((name) => (
          <PartnerMark key={name} name={name} />
        ))}
      </div>
    );
  }

  // Duplicate the list so the -50% loop is perfectly seamless.
  const loop = [...partners, ...partners];

  return (
    <div className="relative mt-3 overflow-hidden" aria-hidden="true">
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: partners.length * 3.2, ease: "linear", repeat: Infinity }}
      >
        {loop.map((name, i) => (
          <PartnerMark key={`${name}-${i}`} name={name} />
        ))}
      </motion.div>
      {/* edges fade into the purple pill */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#3b1278] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#3b1278] to-transparent" />
    </div>
  );
}
