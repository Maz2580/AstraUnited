"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * "Trusted by" logo wall for the sponsorship section (t8). A slow, seamless
 * marquee of monochrome partner logos across the floodlit-navy panel — premium
 * and restrained (the FC Barcelona partner-wall treatment): every mark in a single
 * white ink, dimmed and brightening on hover, so a clashing set of brands reads
 * as one curated, top-tier wall. Reduced-motion falls back to a static row.
 *
 * Marks + names are GENERIC PLACEHOLDERS, not real brands. Drop real sponsor
 * logos (ideally monochrome SVGs) into this list as partnerships are signed.
 */
type Partner = { name: string; mark: ReactNode };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
};

const PARTNERS: Partner[] = [
  {
    name: "Meridian",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c3.2 2.6 3.2 15.4 0 18M12 3c-3.2 2.6-3.2 15.4 0 18" />
      </svg>
    )
  },
  {
    name: "Summit",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M2 21 8 9l4 7 4-10 6 15z" />
      </svg>
    )
  },
  {
    name: "Axiom",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
        <path d="M12 2 21 7v10l-9 5-9-5V7z" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    name: "Vantage",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke} strokeWidth={1.8}>
        <path d="M3 5 12 20 21 5" />
        <path d="M8 5 12 13 16 5" />
      </svg>
    )
  },
  {
    name: "Volta",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M13 2 4 14h7l-2 8 11-13h-7z" />
      </svg>
    )
  },
  {
    name: "Quadra",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.4" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.4" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.4" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.4" />
      </svg>
    )
  },
  {
    name: "Northgate",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke} strokeWidth={1.8}>
        <path d="M5 11 12 5l7 6" />
        <path d="M5 19 12 13l7 6" />
      </svg>
    )
  },
  {
    name: "Orbit",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
        <circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="12" rx="9.2" ry="4.2" />
        <ellipse cx="12" cy="12" rx="9.2" ry="4.2" transform="rotate(60 12 12)" />
      </svg>
    )
  }
];

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-8 text-white/55 transition-colors duration-300 hover:text-white">
      {partner.mark}
      <span className="whitespace-nowrap text-base font-black uppercase tracking-[0.18em]">
        {partner.name}
      </span>
    </div>
  );
}

export function SponsorMarquee() {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-4">
        {PARTNERS.map((partner) => (
          <PartnerLogo key={partner.name} partner={partner} />
        ))}
      </div>
    );
  }

  // Duplicate the list so the -50% loop is perfectly seamless.
  const loop = [...PARTNERS, ...PARTNERS];

  return (
    <div className="relative mt-4 overflow-hidden" aria-hidden="true">
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: PARTNERS.length * 3.4, ease: "linear", repeat: Infinity }}
      >
        {loop.map((partner, i) => (
          <PartnerLogo key={`${partner.name}-${i}`} partner={partner} />
        ))}
      </motion.div>
      {/* edges fade into the floodlit-navy panel */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#06192a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#06192a] to-transparent" />
    </div>
  );
}
