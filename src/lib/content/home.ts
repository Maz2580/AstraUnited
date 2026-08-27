// Hero copy (Revised homepage architecture §1 — "Elite Vision & Immediate
// Action"). The big headline is rendered in JSX inside HeroIntro so "Premier"
// can carry the red brand accent — the same rule the Welcome band follows for
// "United"; everything else lives here verbatim from the team's copy deck.
//
// `status` + `kicker` are currently unrendered: the pitch-status line is being
// rebuilt as the standalone Live Utility Banner (architecture §2), so the copy
// stays here rather than being deleted and immediately re-added.
export const heroContent = {
  status: "All Astra pitches are currently OPEN for training and match days.",
  kicker: "Est. Melbourne's North - Academy & Senior",
  subhead:
    "Inspired by modern European player development models, Astra United FC is dedicated to shaping better players and better people",
  lead:
    "Based in Melbourne's growing northern and eastern suburbs, we provide a highly structured, professional, safe, and enjoyable learning environment built for long-term athletic success. Join Astra United FC today.",
  primaryCta: { label: "Register for 2026 Season", href: "/join-us" },
  // No dedicated trials page yet — /join-us carries both the trial criteria and
  // the interest form. Re-point this the moment a trials page exists.
  secondaryCta: { label: "Book Football Trials", href: "/join-us" }
};

// The Welcome band — "The Brand Philosophy" (Revised homepage architecture §3).
// Only the headline is rendered in JSX (in app/page.tsx), so it can carry the red
// brand accent; both paragraphs are plain prose and live here verbatim.
//
// There is no `subhead` field any more. The deck specs §3 as headline + body with
// no "Small Label" line (§4 and §5 name one explicitly), and the old gold line —
// "Excellence in Local Football and Player Development" — used the exact "local
// football" framing §1 just moved the club away from. Instead `lead` TAKES that
// gold slot: it is the deck's own opening paragraph, set in gold under the
// headline exactly like the hero's §1 sub-headline. Same reasoning as §1, too —
// gold but sentence case, because uppercase over a full sentence reads as
// shouting. That also absorbs the two phrases the deck sets in bold ("Astra
// United FC", "Player Development Academy"): the whole line is now the emphasis,
// so they need no separate weight.
export const welcome = {
  lead: "Welcome to Astra United FC, a progressive, community-focused Player Development Academy designed for players, coaches, and families who demand more from grassroots sports.",
  body: "We believe that every child—regardless of their current playing experience or initial ability—deserves the opportunity to learn, evolve, and enjoy the beautiful game. At Astra United, the Academy represents the beginning of a much larger journey. We are building concrete foundations for future boys' and girls' representative teams. When families join us today, they are stepping onto a long-term development pathway designed to take players from grassroots fundamentals all the way to official, competitive league football."
};

// "Why Families Choose Astra" (Revised content spec §6) — five labelled reasons
// that reinforce the decision to join. Each is a {label, detail} pair: the label
// rides the swinging tag, the detail reveals on hover/focus (and shows inline in
// the accessible/mobile fallback). Verbatim from the team's revised copy.
export const whyFamilies = [
  {
    label: "Qualified Coaching Pedigree",
    detail: "Learn from highly experienced, accredited UEFA and AFC coaches."
  },
  {
    label: "Safe & Inclusive Environment",
    detail: "Built strictly on rigorous child safeguarding and protection frameworks."
  },
  {
    label: "Structured Development Pathway",
    detail:
      "A clear blueprint designed to transition players seamlessly from the Youth Academy to senior football."
  },
  {
    label: "Multicultural Community Focus",
    detail:
      "Uniting diverse families across local Melbourne suburbs through a shared love of the game."
  },
  {
    label: "Elite Training Environments",
    detail: "Access to premium pitches and structured training setups tailored for player growth."
  }
];
