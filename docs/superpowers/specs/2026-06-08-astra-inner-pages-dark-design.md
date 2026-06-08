# Astra United — Inner Pages: Dark Redesign + Real Content (Design)

**Date:** 2026-06-08
**Status:** Approved (brainstorm complete)
**Focus:** Bring the six marketing pages + shop into the dark cinematic system and populate them with real content from the docs. Hybrid block model.
**Predecessors:** `2026-06-07-astra-united-wow-redesign-design.md` (R1), `2026-06-08-astra-homepage-wow-polish-design.md` (R2, homepage dark + ball).

## 1. Goal

The homepage is dark/cinematic and content-rich; the inner pages are not. All six marketing pages render through one generic template (`app/[slug]/page.tsx`) whose middle section is light (`bg-white` + `card-plain`), and the shop page likewise. Bring them into the same dark system and fill them with the real content from `Content Copies-20260602T085649Z-3-001/Content Copies/*.docx`.

## 2. Approved decisions (from brainstorm)

| Decision | Choice |
|----------|--------|
| Page depth | **Hybrid** — dark shared shell + a small kit of reusable block components, composed per page |
| Forms | **Styled forms with real direct contact** — submit opens `mailto:info@astraunitedfootballclub.com`; details/socials/map also shown. No backend. |
| Visual style | Reuse the homepage dark language (`card-dark`, `band-deep`/`band-fog`, `inverse` headers, gold kickers) — no new visual decisions |

## 3. Content model

Replace the flat `MarketingPage.sections` with a typed **block list**. In `src/lib/site-data.ts`:

```ts
export type Block =
  | { type: "prose"; title: string; copy: string; bullets?: string[] }
  | { type: "cards"; title?: string; intro?: string; items: { title: string; copy: string }[] }
  | { type: "table"; title?: string; intro?: string; columns: string[]; rows: string[][] }
  | { type: "steps"; title?: string; items: { title: string; copy: string }[] }
  | { type: "pillars"; title?: string; items: { label: string; copy: string }[] }
  | { type: "contact"; email: string; phone?: string; welfare?: string; socials: { label: string; handle: string; href: string }[]; address: string; mapEmbed: string }
  | { type: "form"; title: string; intro?: string; subjects?: string[]; submitLabel: string; mailto: string };

export type PageHero = { src: string; alt: string; blurDataURL: string };

export type MarketingPage = {
  slug: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  hero: PageHero;          // background photo for the dark page hero
  blocks: Block[];
};
```

`getPageBySlug` and `generateStaticParams` stay. The `pages` array is rewritten with real doc content (below). `MarketingPage.sections` is removed; nothing else consumes it (only `[slug]/page.tsx` does).

## 4. Components

New `src/components/blocks/`:
- `PageHero.tsx` — dark hero with background `next/image` + ink/navy overlay, eyebrow (gold), title (`crest-type`), intro. Reused by `[slug]` and shop.
- `ProseBlock.tsx`, `CardsBlock.tsx`, `TableBlock.tsx`, `StepsBlock.tsx`, `PillarsBlock.tsx`, `ContactBlock.tsx`, `ContactForm.tsx`.
- `BlockRenderer.tsx` — switches on `block.type` and renders the right component inside a `section-band` that alternates `band-deep`/`band-fog` by index.

All use the existing dark utilities and `SectionHeader` (inverse). `ContactForm` is a client component (`"use client"`): builds a `mailto:` href with `subject`/`body` from field state and navigates on submit (no backend).

`app/[slug]/page.tsx` becomes: `<PageHero …/>` → `page.blocks.map((b,i) => <BlockRenderer block={b} index={i} />)` → dark CTA band (reuse existing CTA, recolour to `band-deep`).

`app/shop/page.tsx`: rewrite to use `PageHero` + a couple of blocks (prose + cards) + coming-soon CTA, dark.

## 5. Per-page composition (content from docs)

All hero/in-page imagery comes from existing webps in `public/images` (kit, ground, community, academy, womens, match, camps). "to be confirmed" is used verbatim for anything the docs leave blank — never fabricated.

- **the-club** (`The Club.docx`): hero(ground-wide-sky) → prose "Our Story" (history + mission + the Astra Way) → prose "Honours" (trophy cabinet — years to be confirmed) → cards "Committee & Staff" (Chairperson, Secretary, Treasurer, Head of Academy, First Team Manager, Welfare Officer — names to be confirmed) → prose "Governance & Safeguarding" (constitution, safeguarding, AGM) → contact-style "Facilities" via prose + map (DISC, parking, amenities).
- **teams** (`Teams.docx`): hero(match-aerial-control) → cards "Senior teams" (Men's First Team, Women's First Team, Under-23s) → cards "Youth Academy" (U6-U8, U9-U12, U13-U18 + development-over-results philosophy) → prose "Fixtures & Results" (league-portal links — to be confirmed).
- **join-us** (`Join Us.docx`): hero(academy-training-wide) → table "Membership fees 2026" (Academy U6-U12 / Youth U13-U18 / Senior; amount column "to be confirmed"; "fees cover" note) → steps "How to register" (online form, documentation, payment) → pillars "What we look for" (Technical, Tactical, Physical, Character) → cards "Volunteers" (Team managers/coaches, Match-day marshals, BBQ crew, Referees, Media) → form "Register your interest" (mailto).
- **news-media** (`Latest News.docx`): hero(community-team-photo) → cards "Latest news" (match reports, announcements, player spotlights) → cards "Photo & video gallery" (match-day, academy days, celebrations — full gallery later) → cards "Events calendar" (presentation night, summer gala, fundraisers, holiday camps).
- **sponsors** (`Sponsors & Partners.docx`): hero(kit-ball) → prose "Supporting the Astra vision" (more than a logo on a shirt) → cards "Partnership tiers" (Principal Club Partner, Gold Partners, Community Supporters) → table "Sponsorship packages" (Main Kit, Training Wear, Pitch-side, Player Pathway, Match Ball + benefits) → form/CTA "Enquire about sponsorship" (mailto).
- **contact** (`Contact Us.docx`): hero(ground-player-pitch) → form "Get in touch" (subjects: General, Player Registration & Trials, Sponsorship, Media, Volunteering) → contact (email `info@astraunitedfootballclub.com`, phone "to be confirmed", welfare "to be confirmed", socials, address) + map → prose "FAQ" quick links (where we train / fees / pitch status).
- **shop** (`Club Shop.docx`): hero(kit-ball) → prose "Gear up for game day" → cards "Official match & training kit" + "Supporter & fan wear" → coming-soon CTA (email for kit enquiries).

## 6. Map

`ContactBlock` embeds a keyless Google Maps `<iframe>` for "Darebin International Sports Centre, 281 Darebin Road, Thornbury VIC 3071" (standard `https://www.google.com/maps?q=…&output=embed` src), lazy-loaded, with a title for a11y.

## 7. Testing

- The block list is typed data — TS guards correctness at build. Add a small vitest in `src/lib/site-data.test.ts`: every page has a hero + ≥1 block; `getPageBySlug` returns the right page and `undefined` for unknown slugs; every `form` block's `mailto` targets the club email.
- `npm run typecheck` + `npx vitest run`.
- Visual verify via Vercel preview (push branch to `personal`), then production.

## 8. Non-goals (later rounds)

Real photo/video gallery; working backend forms / spam protection; live fixtures & league-table embeds; a real online store/checkout; per-sub-page routes (sub-sections stay as blocks on the main page). Header/footer unchanged (already dark).

## 9. Git / deploy

Branch `inner-pages-dark` off `main`. Author as personal `mazdak.gh1995@gmail.com`, **no Co-Authored-By trailer**. Preview deploy first, production after sign-off. See `[[astra-vercel-deploy]]`, `[[astra-git-identity]]`.
