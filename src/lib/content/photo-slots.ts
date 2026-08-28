import type { PhotoOverrides } from "./types";

export type PhotoSlot = {
  key: string;
  label: string; // shown in the admin Photos tab
  default: { src: string; alt: string; blurDataURL?: string };
};

// Defaults duplicated from app/page.tsx + site-data heroes ON PURPOSE: the
// registry is the single list the admin sees; the pages keep working even if
// a slot is removed here. src/alt/blurDataURL are copied verbatim.
export const PHOTO_SLOTS = [
  {
    key: "home-welcome",
    label: "Homepage — Welcome section photo",
    default: {
      src: "/images/academy/astra-academy-training-wide-1280.webp",
      alt: "Astra United youth academy players in training bibs during a drill session on the DISC Darebin pitch",
      blurDataURL:
        "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAsAA4BaJbAAAxZbZ/GZAAD+1z/ZYKqmtnVc6okA+qCnDfoYAtrg2zI4XIaE2KYUl2ZAO/KqM+alyLiJIxqwefcpOOsovAA="
    }
  },
  {
    key: "home-academy-mini",
    label: "Homepage — Pathway row 1: Astra Foundation Hub (U5–U7)",
    default: {
      src: "/images/academy/astra-academy-mini-kickers-1280.webp",
      alt: "Young Astra United Academy players in navy kit and Academy bibs with their coaches during a Mini-Kickers session at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADQAQCdASoQAAsAA4BaJbAAAhtn5084gAD+zezGkLAu1xBrykDOkTySbYuCC4ne6i0bTM/ToTRP7AFbfDayLKbGGuvZEFWIn2UTcr6zkt7iP5ZE+siu60gA"
    }
  },
  {
    key: "home-academy-junior",
    label: "Homepage — Pathway row 2: Astra Youth Academy (U8–U10)",
    default: {
      src: "/images/academy/astra-academy-dribble-duel-1280.webp",
      alt: "Astra United youth player in navy kit dribbling past a defender during an academy training session at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAsAA4BaJYgAAv+5vRNYAAD+voAKXwDNy2IhEEynnmVSeUn0lKdwz3awb6C8nEReoy/qU7ZZOAAA"
    }
  },
  {
    key: "home-academy-youth",
    label: "Homepage — Pathway row 3: Next-Gen Performance Program (U11–U13)",
    default: {
      src: "/images/academy/astra-academy-youth-training-1280.webp",
      alt: "Astra United youth players in kit and bibs training in a small-sided session with coaches on the Darebin pitch",
      blurDataURL:
        "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAwAgCdASoQAAsAA4BaJagAAug2DgKfvetyAAD+xgfUyNK1w/lKOAgtvSCzlOqE+Hx4eWtZ3HVEdEyE3fivfit5t5StKNB36j998NH3YYAAAA=="
    }
  },
  {
    key: "home-program-performance",
    label: "Homepage — Pathway row 4: High Performance Track (U14–U15)",
    default: {
      src: "/images/academy/astra-academy-coaching-huddle-1280.webp",
      alt: "Astra United coaches and advanced youth players in a high-intensity training huddle on the Darebin pitch"
    }
  },
  {
    key: "home-program-girls",
    label: "Homepage — Pathway row 5: Private Football Sessions (all ages)",
    default: {
      src: "/images/womens/astra-girls-program-wide-1280.webp",
      alt: "Astra United girls' program player holding a football on the pitch at Darebin International Sports Centre"
    }
  },
  // Club Essentials (architecture §7) took the card design the pathway rows gave
  // up, so its three items need photos of their own — the five pathway shots are
  // all spoken for.
  //
  // These three are GENERATED (Higgsfield "soul_location", Aug 2026), not club
  // photography, which is why they are places and equipment with no people in
  // them: putting AI-generated children on a real club's site would be a claim
  // about the club that a parent could reasonably take at face value. Their alt
  // text describes a generic suburban ground rather than asserting it is Astra's,
  // for the same reason. Replace them with real club photography via /admin
  // whenever the club has it — the slot keys make that a swap, not a code change.
  {
    key: "home-essential-club",
    label: "Homepage — Club Essentials: Meet the Club card",
    default: {
      src: "/images/ground/astra-ground-clubhouse-dugout-1280.webp",
      alt: "A suburban football clubhouse and covered players' dugout beside a grass pitch in late afternoon sun"
    }
  },
  {
    key: "home-essential-trials",
    label: "Homepage — Club Essentials: Trials & Fees card",
    default: {
      src: "/images/kit/astra-kit-boots-ball-touchline-1280.webp",
      alt: "Football boots, shin pads, a match ball and a folded training bib laid out on the touchline of a dewy grass pitch"
    }
  },
  {
    key: "home-essential-fixtures",
    label: "Homepage — Club Essentials: Fixtures & Events card",
    default: {
      src: "/images/ground/astra-ground-floodlit-dusk-1280.webp",
      alt: "A floodlit suburban football ground at dusk, corner flag in the foreground and an empty stand beyond"
    }
  },
  {
    key: "home-news",
    label: "Homepage — News & media photo",
    default: {
      src: "/images/community/astra-community-team-photo-1280.webp",
      alt: "Astra United FC youth squad and coaching staff posing for a team photo at the Darebin ground",
      blurDataURL:
        "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsAA4BaJaAC7AEO51NfsyAA/uhR8gOKYM+H/sHOAha6twOxn++SjZ011xmUaPcrFeIDsIUFYFIA3e9Pz9z6rxA4narSxexzNwWSAAA="
    }
  },
  {
    key: "hero-the-club",
    label: "The Club — page hero",
    default: {
      src: "/images/community/astra-community-squad-portrait-1920.webp",
      alt: "Astra United FC youth team and coaching staff together on the grass at Darebin International Sports Centre",
      blurDataURL:
        "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAADwAQCdASoQAAsABABoJZgAAuXOXCXDyAAA/tc/3Z/dDhnMvQ0+6YsPJeM0qInnDy/v+MSoBiaFpczmNLw+iIPkoreRBW0fZLffCwo/VV78AA=="
    }
  },
  {
    key: "hero-teams",
    label: "Teams — page hero",
    default: {
      src: "/images/academy/astra-academy-youth-training-1920.webp",
      alt: "Astra United juniors playing a small-sided training match between mini goals on the Darebin pitch",
      blurDataURL:
        "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAACwAQCdASoQAAsABABoJagAAubJvYSYAP6Rv3r8r1oqJkbuqTQQUc8+QzWTqElaiZDoOOSvLLtlu4BZ8VzR3vVc7r98ALmAQAA="
    }
  },
  {
    key: "hero-join-us",
    label: "Join Us — page hero",
    default: {
      src: "/images/academy/astra-academy-training-wide-1920.webp",
      alt: "Astra United youth academy players in training bibs during a drill session at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAsAA4BaJbAAAxZbZ/GZAAD+1z/ZYKqmtnVc6okA+qCnDfoYAtrg2zI4XIaE2KYUl2ZAO/KqM+alyLiJIxqwefcpOOsovAA="
    }
  },
  {
    key: "hero-news-media",
    label: "News & Media — page hero",
    default: {
      src: "/images/community/astra-community-team-photo-1920.webp",
      alt: "Astra United FC youth squad and coaching staff posing for a team photo at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsAA4BaJaAC7AEO51NfsyAA/uhR8gOKYM+H/sHOAha6twOxn++SjZ011xmUaPcrFeIDsIUFYFIA3e9Pz9z6rxA4narSxexzNwWSAAA="
    }
  },
  {
    key: "hero-sponsors",
    label: "Sponsors — page hero",
    default: {
      src: "/images/kit/astra-kit-ball-1920.webp",
      alt: "Astra United Academy jersey beside the official match ball at the Darebin ground",
      blurDataURL:
        "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADwAwCdASoQABgAPu1iqk2ppaQiMAgBMB2JYgCdOUAAhXd8KMmZvxcAANc0QbnWA1e8eb71ZbYLPRtgKeFJOG3r962snakr3n7F2TwlfVFXyug2uWIbf+6UsjPW0qj8Ves/Qn88QAA="
    }
  },
  {
    key: "hero-contact",
    label: "Contact — page hero",
    default: {
      src: "/images/academy/astra-academy-coaching-huddle-1920.webp",
      alt: "Astra United coach gathered with young academy players for a huddle on the Darebin pitch",
      blurDataURL:
        "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADQAQCdASoQAAsABABoJZAAAuTwLVg8MAD+2+r5XKqoDqH7LCRtylnH9Qt9/v/Is3f8I/MoV315TuwN/+kHc+SiN5W9akQA"
    }
  }
] as const satisfies readonly PhotoSlot[];

export type SlotKey = (typeof PHOTO_SLOTS)[number]["key"];

export type ResolvedPhoto = {
  src: string;
  alt: string;
  blurDataURL?: string;
  isOverride: boolean;
};

export function resolvePhoto(key: SlotKey, overrides: PhotoOverrides): ResolvedPhoto {
  const slot = PHOTO_SLOTS.find((s) => s.key === key);
  if (!slot) {
    console.error(`[photo-slots] unknown slot key: "${key}"`);
    return { src: "", alt: "", isOverride: false };
  }
  const override = overrides[key];
  if (override?.url) {
    // alt stays from the registry; uploads have no blur placeholder.
    return { src: override.url, alt: slot.default.alt, isOverride: true };
  }
  return { ...slot.default, isOverride: false };
}

/** Runtime check that a dynamic string is a known slot key (for `hero-${slug}`). */
export function isSlotKey(key: string): key is SlotKey {
  return PHOTO_SLOTS.some((s) => s.key === key);
}
