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

// The Astra Player Development Model (Revised homepage architecture §4) — the
// four coaching pillars. These were already on the page as a strip tucked under
// the program cards; Round 7 promotes them to a section of their own, ahead of
// the pathway grid, because the deck wants "how we develop players" answered
// before "where does my child fit".
//
// Each pillar is {label, title, copy}: the label rides the rail node, the title
// is the bold line the deck sets under each heading, and the copy is its
// description. The fourth pillar is "Psychological" — it replaces the older
// "Character", per the deck.
export const developmentModel = {
  eyebrow: "Our methodology",
  intro:
    "Our elite coaching philosophy doesn't leave development to chance. We meticulously train the complete athlete by focusing on four interconnected sports-science disciplines:"
};

export const developmentPillars = [
  {
    label: "Technical",
    title: "Ball Mastery & Precision",
    copy: "Developing an impeccable first touch, passing accuracy, receiving, advanced dribbling, and goal-scoring precision."
  },
  {
    label: "Tactical",
    title: "Game Intelligence",
    copy: "Cultivating elite decision-making, spatial awareness, positional discipline, movement off the ball, and overall tactical intelligence."
  },
  {
    label: "Physical",
    title: "Physical Literacy",
    copy: "Enhancing core coordination, balance, agility, explosive speed, and age-appropriate movement mechanics."
  },
  {
    label: "Psychological",
    title: "Mindset & Resilience",
    copy: "Building deep self-confidence, concentration, resilience, emotional regulation, teamwork, and positive sporting behaviours."
  }
];

// Trust, Safety & Professional Standards (Revised homepage architecture §6) —
// the parent-reassurance band. This REPLACES the five "Why families choose Astra"
// reasons: the deck answers the same question a parent is asking, but with
// specific checkable credentials (WWCC, insurance frameworks) rather than general
// qualities, which is the whole point of the section per its user-flow goal.
//
// The headline lives in JSX in app/page.tsx so it can carry the red accent; the
// lead-in and the four guardrails are plain prose and live here verbatim. The
// deck specs no Small Label for §6, so — as in §3 — the lead-in takes the gold
// accent line instead of a separate subhead.
export const trustStandards = {
  intro:
    "At Astra United FC, providing a safe, inclusive, and professionally managed environment is our highest priority. We eliminate the guesswork for families by operating under strict professional guardrails:",
  items: [
    {
      label: "Child Safe Commitment",
      detail: "Fully aligned with national child safe frameworks and rigid internal club protocols."
    },
    {
      label: "Rigorous Child Safeguarding Policies",
      detail:
        "Every coach and staff member holds verified technical qualifications and mandatory Working with Children Checks (WWCC)."
    },
    {
      label: "Comprehensive Insurances",
      detail:
        "Fully backed by robust Public Liability and Professional Indemnity Insurance frameworks."
    },
    {
      label: "Inclusive Culture",
      detail:
        "A supportive, positive, and pressure-free learning environment where mistakes are embraced as vital learning tools."
    }
  ]
};
