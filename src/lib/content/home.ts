export const heroContent = {
  status: "All Astra pitches are currently OPEN for training and match days.",
  kicker: "Est. Melbourne's North - Academy & Senior",
  headline:
    "The Home of Football Community & Player Development in Melbourne's Suburbs",
  lead:
    "Astra Football Club provides a professional, highly structured football environment for local families across Melbourne's growing northern and eastern suburbs, based at Darebin International Sports Centre.",
  primaryCta: { label: "Register for 2026", href: "/join-us" },
  secondaryCta: { label: "View match-day fixtures", href: "/teams" }
};

// "Welcome to Astra Football Club" — the first standalone section after the
// hero motion (Revised content spec §3). The big headline is rendered in JSX so
// "United" can carry the red accent; this object holds the subheadline + the two
// intro paragraphs verbatim from the team's revised copy.
export const welcome = {
  subhead: "Excellence in Local Football and Player Development",
  intro: [
    "Welcome to Astra Football Club, a premier community-focused football club for players, coaches, and supporters. We are dedicated to fostering a professional environment where talent is meticulously nurtured from the grassroots up.",
    "Whether you are looking for an elite Youth Academy with professional, highly qualified coaching or a competitive senior football team, Astra FC offers a distinct pathway for every player. Our mission is to combine technical excellence with a strong community spirit, ensuring every member of the Astra family can reach their full potential on the pitch. As a standout Melbourne soccer club, we proudly embrace the city's vibrant multicultural football culture and community values across all local Melbourne suburbs."
  ]
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
