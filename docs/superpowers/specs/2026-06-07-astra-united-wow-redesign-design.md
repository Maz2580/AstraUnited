# Astra United FC — "Wow" Redesign & Real Content Rollout

**Date:** 2026-06-07
**Status:** Draft for approval
**Owner:** Maz (maz2580)
**Live site:** https://astra-united.vercel.app (Vercel project `astra-united`, personal scope, auto-deploys from `personal/main` → `Maz2580/AstraUnited`)

---

## 1. Background & problem

The Astra United FC site is live but reads as an unfinished demo rather than a real, premium football club:

1. **Placeholder voice.** `src/lib/site-data.ts` and `app/page.tsx` contain agency/dev meta-language that is currently published to the public site — e.g. *"the site is prepared for…"*, *"Wix replacement pages"*, *"ready for a richer gallery in Phase 2"*, *"the admin events scaffold is ready for the next phase."*
2. **Missing real content.** The team supplied rich, specific copy (Home, The Club, Teams, Join Us, News & Media, Sponsors, Contact, Club Shop, and a full founder bio for **Dr Alireza Emamifar**) plus a 12-month content calendar and ~1,300 real photos + 24 video clips. Almost none of it is on the site.
3. **Weak craft.** Display font is `Arial Black` (a system fallback). The hero uses a single muted image at 32% opacity.
4. **Rough motion.** The existing scroll-ball ("Touchline") traces per-card-group rectangle perimeters, snaps when the active group changes, periodically teleports (`% 1` wrap), and recomputes layout for every group on every scroll event. It feels janky.

## 2. Goals

- Make the site feel **"wow"**: cinematic, confident, premium — an elite-feeling community club.
- Replace **all** placeholder/meta copy with the **team's real content**, in the club's voice.
- Add a **founder feature** (Dr Emamifar) — the club's single biggest credibility asset.
- Rebuild the scroll-ball motion to be **professional and smooth** (the team's own "Touchline" concept, done right).
- Architect the hero/motion so the **team's forthcoming animation frames** drop in later with **no rebuild**.
- Use the **real photos/videos now**; design for easy asset replacement later.

## 3. Non-goals (this project)

- No live fixtures/league-table API integration (link out / embed placeholder is fine — copy already says "embedded widget").
- No e-commerce build for the shop (link to external store, per team copy).
- No working contact-form backend in round 1 (form UI + mailto/validation; wire to a provider later).
- No CMS migration. Content stays in typed data files / MDX for now.
- No change to the admin/Supabase auth scaffolding beyond what content needs.

## 4. Art direction (approved)

**Direction A (Cinematic Pitch)** as the base, merged with **B** and **C**:

- **From A:** dark, cinematic, full-bleed match photography; huge bold **athletic** type; the Touchline ball + trail; dramatic navy→ink gradients with red/gold accents.
- **From B:** editorial energy — stat rails, diagonal red cuts, big numeric callouts.
- **From C:** warmth — mosaics/filmstrips of real club moments; family-first, multicultural belonging.

Brand palette stays Astra's own (do **not** adopt the mockup's gold/serif "Australian Turntables" skin — only its *motion concept* is borrowed): `--astra-ink #06111a`, `--astra-navy #001c2a`, `--astra-red #c81916`, `--astra-gold #f2c94c`, `--astra-turf #0f5a46`, `--astra-white #f8fbfd`.

## 5. Design system upgrades

- **Typography:** replace `Arial Black` with a self-hosted athletic display face via `next/font` — **Archivo (Black/Expanded)** or **Anton** for display; **Inter** stays for body. Self-hosted = fast, no layout shift, no external request.
- **Image treatment:** a consistent film look (`saturate(.9) contrast(1.05)`) + vignette on hero/gallery imagery.
- **Surfaces:** richer dark sections; keep card system but reduce decorative noise.
- **Tokens:** keep the existing CSS custom properties in `globals.css`; extend with motion-path and type tokens. No Tailwind config breakage.

## 6. Information architecture

Matches the team's sitemap. Pages (App Router):

| Route | Content source |
|---|---|
| `/` Home | `Home.docx` + curated highlights |
| `/the-club` | `The Club.docx` (history, committee, governance, facilities) |
| `/the-club/founder` (or section) | `Dr Emamifar - Bio.docx` |
| `/teams` | `Teams.docx` (senior, women's, U23, academy, fixtures) |
| `/join-us` | `Join Us.docx` (registration, trials, volunteers) |
| `/news-media` | `Latest News.docx` (news, gallery, events) |
| `/sponsors` | `Sponsors & Partners.docx` (tiers, packages) |
| `/contact` | `Contact Us.docx` (DISC address, socials, welfare) |
| `/shop` | `Club Shop.docx` (link to external store) |

Nav stays driven by `navItems` in `site-data.ts`.

## 7. Homepage section flow

1. **Hero** — cinematic media stage (photo/video now → frames later), live **pitch-status pill**, bold headline, two CTAs (Register 2026 / View fixtures), stat rail (B), warm filmstrip of real moments (C), Touchline ball begins here.
2. **Live pitch status + next campaign moment** — real status bar (text, not image, for SEO per team note).
3. **Welcome / why families choose Astra** — real welcome copy + the four real differentiators as stat cards.
4. **The Touchline academy pathway** — Mini-Kickers → Junior → Youth → Senior; the ball sweeps this section.
5. **Founder feature: Dr Emamifar** — portrait + condensed story + pull-quote ("We don't just coach players. We mentor the next generation of community leaders.") → link to full bio.
6. **Senior & Women's teams** — real Teams copy.
7. **News & media** — real photos, real recent post.
8. **Sponsors** — partnership invite + package teaser.
9. **Join / contact CTA** — registration + DISC location.

## 8. The Touchline motion — redesign (core technical work)

### 8.1 Current model (to replace)
Per-group rounded-rect perimeter tracing in `ScrollBallFlow.tsx`; active-group scoring per scroll event; `% 1` route wrap; `getBoundingClientRect` thrash; rotation ∝ absolute page progress; heavy HUD chrome.

### 8.2 New model
- **One master path.** A single SVG path spanning the full scroll length, living mostly in the page **spine/gutter**, gently dipping toward section anchors at transitions. Defined once from section anchor points (elements tagged `data-touchline-node`), rebuilt only on resize/layout — not per scroll event.
- **Arc-length parameterization.** Precompute cumulative path length; `ballPosition = pathPointAtLength(progress × totalLength)`. Constant visual speed, no teleports.
- **Single smoothed driver.** Read Lenis's smoothed scroll once per rAF tick (the existing Lenis rAF loop), map to `progress ∈ [0,1]`. Drive ball/trail from that — no `useMotionValueEvent` per-event recompute.
- **Roll ∝ velocity.** `rotation += deltaDistance / circumference`. Soft multi-sample trail. No bounce.
- **Cards react, ball flows.** Keep proximity reactions (lift + gold rim-light, staggered = passing wave) via `data-touchline-react` items; compute reaction from distance to the ball point. The ball never traces a card.
- **Calm chrome.** Remove/min the HUD (minute clock, km, possession, tempo, side rails). Optional: a single faint yard-mark spine. Default to **less**.
- **Reduced motion / mobile.** Reduced-motion = static settled state (ball pinned as quiet section markers, no scroll-linking). Mobile = centered vertical spine, reactions become fades.

### 8.3 Component shape
- `Touchline` (replaces `ScrollBallFlow`): owns Lenis, the master path, the rAF driver, and the ball/trail render. Reads `data-touchline-node` (path anchors) and `data-touchline-react` (reacting cards).
- Keep file focused; extract pure helpers (`buildMasterPath`, `pointAtLength`, `sampleProgress`) for testability.

## 9. Hero media & frame-sequence architecture

Single boundary component `HeroMedia` with a discriminated-union source:

```ts
type HeroSource =
  | { kind: "image"; src: string; alt: string }
  | { kind: "crossfade"; images: { src: string; alt: string }[]; intervalMs: number }
  | { kind: "video"; src: string; poster: string }   // muted, loop, playsInline
  | { kind: "frames"; framePattern: string; frameCount: number }; // scroll-scrubbed canvas
```

- **Now:** `image` or `crossfade` (curated photos) or `video` (encoded from phone clips).
- **Later:** swap the prop to `frames` — a canvas pins and scrubs the team's frame sequence on scroll. The rest of the hero (copy, CTAs, ball handoff) is unchanged. **No rebuild.**
- `frames` mode preloads, draws to `<canvas>`, maps scroll progress → frame index; degrades to a static poster under reduced-motion / slow connection.

## 10. Content migration

- Extend `site-data.ts` types to carry richer content (pull-quotes, tables for sponsorship tiers, contact details, founder fields) — or move long-form pages to MDX under `content/`. Decision in plan: prefer typed data for structured pages, MDX only if a page is genuinely article-like.
- Port **real copy** verbatim (lightly tidied) from each `.docx`. Remove every meta/"Phase 2"/"Wix" phrase.
- Founder data: name, titles, story, credentials (ACSP, ACFAM, Ph.D.), honours, pull-quote, portrait.
- Replace fabricated specifics with team-provided ones; leave clearly-marked `[Insert …]` items (fees, phone, email, committee names) as graceful "coming soon"/contact-prompts rather than fake data.

## 11. Asset pipeline

- Select ~30–40 best photos across academy/match/women's/community/camps.
- **Auto-orient** (the DSLR JPGs are rotated 90°) + resize to web widths (e.g. 1920/1280/800) + compress (sharp), output to `public/images/<category>/`.
- Optionally encode 2–3 short **muted `mp4`+`webm`** loops from the best phone clips for hero/ambient.
- Generate `blurDataURL` placeholders for `next/image`.
- Build runs on the C: mirror (per existing workflow) due to S: drive `next build` issues.

## 12. Accessibility & performance

- Maintain `prefers-reduced-motion` everywhere (static fallback).
- Decorative motion is `aria-hidden`; real content is semantic and keyboard-navigable.
- `next/image` for all photos; `next/font` self-hosted; lazy-load below-the-fold media; keep LCP image priority on hero.
- Color contrast checked on dark surfaces (gold/white on ink).

## 13. Delivery phasing (recommended)

- **Round 1 (biggest visible wow):** design system (type/tokens), hero rebuild + `HeroMedia`, **Touchline motion rebuild**, homepage real content, **founder feature**, asset pipeline for the photos the homepage needs.
- **Round 2:** real content across all inner pages (The Club, Teams, Join Us, News & Media, Sponsors, Contact, Shop) + gallery.
- **Round 3:** polish — video loops, crossfades, gallery expansion, and dropping in the team's motion frames when delivered.

Each round ships independently to production via `git push`.

## 14. Risks & mitigations

- **S: drive build failures** → keep verifying on the C: mirror (`C:\tmp\astra-united-vercel-check-fresh`).
- **Motion regressions / jank** → extract pure helpers and verify smoothness on the mirror preview before pushing; reduced-motion path must always work.
- **Large image set** → only process curated subset; never commit raw originals.
- **Placeholder data** ([Insert fee], committee names) → render as honest "contact us"/"coming soon", never fabricate.

## 15. Open items for the team (not blockers)

Membership fees, phone number, club/welfare emails, committee & coaching names, trophy-cabinet years, trial dates, sponsor logos. Site will present these as clearly-styled "to be confirmed" / contact prompts until supplied.
