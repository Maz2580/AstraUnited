# Astra United — Homepage "$10k" Polish & Ball Redesign (Design)

**Date:** 2026-06-08
**Status:** Approved (brainstorm complete)
**Focus:** Refinement of the EXISTING homepage only. No new routes/pages.
**Predecessor:** Round 1 (`docs/superpowers/specs/2026-06-07-astra-united-wow-redesign-design.md`) shipped the cinematic hero, the first touchline ball, the founder feature, and real content.

## 1. Goal

Lift the live homepage (https://astra-united.vercel.app) from "competent" to "looks like a $10,000 site," and fix the two things the client called out:

1. **The ball's motion is not professional** — today it zig-zags the full page width and floats over headings.
2. **The ball itself is not a real ball** — today it's a stylised SVG with a red star stamped on it.

The single biggest lever is **art-direction consistency**: the official brand (crest + the Wix "coming soon" site) is **dark, cinematic, bold**, but the current homepage body is mostly light/white. We realign the whole page to the brand.

## 2. Approved decisions (from visual brainstorm)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Art direction | **Dark & cinematic**, carried end-to-end, broken by lighter "stadium-fog" bands so it breathes |
| 2 | The ball | **Refined Lucide-lab `soccer-ball` line ball** (thin stroke, modern/designer) |
| 3 | Motion path | **Side touchline rail** — ball runs down the left gutter, gently curving, never crossing content |
| 4 | Assembled look | Approved: marquee, image-forward cards, cinematic founder band, tighter rhythm |

## 3. Brand tokens (existing — `tailwind.config.ts`)

`navy #001c2a` · `ink #06111a` · `red #c81916` · `white #f8fbfd` · `steel #9fb5c4` · `turf #0f5a46` · `gold #f2c94c`. No new tokens required; we change which sections *use* the dark tokens.

## 4. The ball (`src/components/SoccerBall.tsx`)

Replace the star-emblem SVG with the **Lucide lab `soccer-ball`** geometry (ISC-licensed):

- `viewBox 0 0 24 24`, `fill="none"`, round caps/joins, `stroke` driven by a prop (default `currentColor`) so it can render white on the rail and gold at the hero handoff.
- Keep the `className` + `label` API so existing call-sites (`Touchline`, `HeroIntro`) don't change shape.
- Add an optional `stroke` and `strokeWidth` prop. Default stroke `#f8fbfd`, width `1.6`.
- Drop a soft `drop-shadow` via CSS where it sits (already applied in `Touchline`).

Rationale: minimal, crisp at any size, ~1KB, rotates cleanly. No new dependency (we do **not** take the Three.js route).

## 5. The motion (`src/components/Touchline.tsx` + `src/lib/touchline/`)

### 5.1 Path — side rail
- **Node x-positions:** instead of `i % 2 === 0 ? margin : cWidth - margin` (full-width alternation), all nodes sit in the **left gutter** with a small alternating offset that produces a gentle vertical wave, e.g. `railX ± wave` where `railX = clamp(28, cWidth * 0.06, 96)` and `wave ≈ 18px`. The path never enters the content column.
- Keep the Catmull-Rom polyline (`buildPolyline`) and arc-length sampling — only the node x-generation changes.
- **New pure helper** `railNodes(count, cHeight, railX, wave)` in `src/lib/touchline/path.ts`, unit-tested: returns nodes whose `x` stays within `[railX - wave, railX + wave]` and whose `y` is evenly distributed across the content height. This isolates the geometry decision and keeps it testable.

### 5.2 Motion quality (the "not professional" fix)
- **Stop corner-cutting:** drive the ball position **directly from arc-length progress** each frame (`pointAtProgress(poly, progress)`), removing the heavy positional `LERP 0.18` lag that makes it drift/cut. Apply only a *light* smoothing (`LERP ≈ 0.35`) to mask scroll jitter, or none if direct tracking reads clean on a near-vertical path.
- **Roll physics unchanged:** rotation still derives from distance travelled × `rollDelta(dist, BALL_RADIUS)` (real radius, `2πr`). On a near-vertical rail the ball mostly rolls forward — correct and calm.
- **Chalk touchline that draws on:** the base path renders as a faint dashed **chalk-white** line (the touchline); the revealed portion behind the ball is solid (white→gold). Reuse the existing `strokeDasharray/strokeDashoffset` reveal driven by `progress`.
- Keep Lenis (`duration 1.08`, smoothWheel) and the single rAF loop.
- Keep `[data-touchline-react]` proximity reactions; with a side rail, cards light up as the ball passes their vertical band (tune `REACT_RADIUS`).
- **Reduced motion:** unchanged — rail/ball not rendered; sections still visible.

## 6. Section-by-section polish (`app/page.tsx` + components)

The page currently alternates dark hero → white bands. Convert the white bands to the dark system so the theme is continuous.

1. **Hero (`HeroIntro.tsx`)** — already dark; keep. Hero handoff ball uses the new line ball (gold stroke). Verify per-image crop positions still keep faces visible.
2. **Brand marquee (NEW `src/components/BrandMarquee.tsx`)** — full-bleed red strip under the hero: "TRAIN / COMPETE / REPEAT /" looping. CSS marquee, `aria-hidden`, paused under `prefers-reduced-motion`.
3. **Welcome / Why Astra band** — convert from white to a **"stadium-fog"** dark gradient (`navy→ink`). Keep gold kicker + headline; "Why families choose Astra" as a clean checklist.
4. **Youth Academy** — replace flat bordered age-group boxes with **image-forward cards**: photo top (from `public/images/manifest.json`), dark body, gold age label, hover lift. `U6–U8 Mini-Kickers`, `U9–U12 Junior Academy`, `U13–U18 Youth Development`.
5. **Founder band (`FounderFeature.tsx`)** — already dark; refine to fully cinematic (portrait left as placeholder until the real Dr Emamifar photo arrives, pull-quote, "Read the full story" → still `/the-club` since no new route this round; if `/the-club/founder` doesn't exist, link `/the-club`).
6. **Senior pathway** — convert white → dark; keep the women's photo with its corrected `object-[center_22%]` framing.
7. **Sponsors** — already dark; keep, tidy the tier cards to match the new card style.
8. **Footer (`SiteFooter.tsx`)** — keep tagline; ensure real contact: email `info@astraunitedfootballclub.com`, socials IG `@AstraFC_Official`, FB `/AstraFootballClub`, X `@Astra_FC`, ground `Darebin International Sports Centre, 281 Darebin Road, Thornbury VIC 3071`.

**Consistency pass:** unify gold kickers (`SectionHeader.tsx`), vertical rhythm/spacing, and card styling across all sections.

## 7. Real content to wire in (from `Content Copies/`)

Add to `src/lib/site-data.ts` (homepage-visible only this round):
- Contact: email, phone (still "to be confirmed" — not in docs), socials, home-ground address.
- The four trial/development pillars (Technical Ability · Tactical Awareness · Physical Literacy · Character) — surface where natural (academy or why-Astra). Membership tiers stay labelled, fees "to be confirmed".
- Never fabricate: committee names, trophy years, fees, phone remain honest placeholders.

## 8. Brand & metadata (`app/layout.tsx`)

- Add **favicon** (fixes the live 404) using the crest — Next.js `app/icon.png` (and `apple-icon.png`) convention, generated from `Astra Logo-Final.png`.
- `metadata`: title/description from `Home.docx` SEO copy; add **OpenGraph/Twitter** card with an OG image (hero photo) so shared links look premium.

## 9. Components touched / created

- **Edit:** `SoccerBall.tsx`, `Touchline.tsx`, `src/lib/touchline/path.ts`, `app/page.tsx`, `HeroIntro.tsx`, `FounderFeature.tsx`, `SiteFooter.tsx`, `SectionHeader.tsx`, `app/layout.tsx`, `app/globals.css`, `src/lib/site-data.ts`.
- **Create:** `BrandMarquee.tsx`, `app/icon.png` / `apple-icon.png`, possibly an image-forward `AcademyCard` (or inline in `page.tsx`).

## 10. Testing & verification

- **Unit (vitest, runs on S:):** new `railNodes` helper — nodes stay within the rail band, correct count, y-distribution; existing `path`/`progress` tests stay green.
- **Type:** `npm run typecheck`.
- **Build/visual:** `next build` fails on S: — verify via Vercel **cloud preview** (push a non-`main` branch to `personal`) or the C-mirror `C:\tmp\astra-united-vercel-check-fresh`. Check desktop + mobile, motion smoothness, reduced-motion, faces-visible.

## 11. Non-goals (later rounds)

No new pages/routes; no inner-page buildout (The Club, Teams, Join Us, News, Sponsors, Shop, Contact); no Three.js ball; no video loops; no team frame-sequence motion; no gallery; no forms/registration. These are the next sub-projects.

## 12. Git / deploy

Branch off `main`, author as personal `mazdak.gh1995@gmail.com`, **no Co-Authored-By trailer**. Preview deploy first (push branch to `personal`), then production (`personal/main`) after the client reviews. See `[[astra-vercel-deploy]]`, `[[astra-git-identity]]`.
