# Astra Inner Pages — Dark Redesign + Real Content — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the six marketing pages + shop into the dark cinematic system and populate them with real doc content, via a typed block model rendered by a reusable block-component kit.

**Architecture:** `site-data.ts` gains a typed `Block` union and each page becomes `{hero, blocks[]}` filled from the `.docx` content. A `src/components/blocks/` kit (one component per block type) reuses the homepage dark language. `app/[slug]/page.tsx` becomes a thin renderer (PageHero → BlockRenderer per block → CTA); the shop page uses the same shell. Forms are styled and submit via `mailto:` (no backend).

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind, next/image, lucide-react, vitest.

**Spec:** `docs/superpowers/specs/2026-06-08-astra-inner-pages-dark-design.md`
**Branch:** `inner-pages-dark` (created, spec committed). Author personal `mazdak.gh1995@gmail.com`. **No Co-Authored-By trailer.** Build verification via Vercel preview (S: build fails).

---

## File Structure

- `src/lib/site-data.ts` — add `Block`/`PageHero` types, `mapEmbedSrc`, rewrite `MarketingPage` + `pages` with real content; keep `getPageBySlug`, `navItems`, `socialLinks`, `clubContact`, everything else.
- `src/lib/site-data.test.ts` — NEW vitest for page/block integrity.
- `src/components/blocks/PageHero.tsx` — dark page hero with bg photo.
- `src/components/blocks/ProseBlock.tsx`, `CardsBlock.tsx`, `TableBlock.tsx`, `StepsBlock.tsx`, `PillarsBlock.tsx`, `ContactBlock.tsx` — block renderers.
- `src/components/blocks/ContactForm.tsx` — client form → mailto.
- `src/components/blocks/BlockRenderer.tsx` — switch on block type, wrap in alternating band.
- `app/[slug]/page.tsx` — rewrite to render hero + blocks + CTA.
- `app/shop/page.tsx` — rewrite dark using PageHero + blocks.

---

## Task 1: Block model + real page content (`site-data.ts`)

**Files:**
- Modify: `src/lib/site-data.ts`

- [ ] **Step 1: Replace the `MarketingPage` type and add block types**

In `src/lib/site-data.ts`, replace the existing `MarketingPage` type definition (the `export type MarketingPage = {...}` block) with:

```ts
export type Block =
  | { type: "prose"; title: string; copy: string; bullets?: string[] }
  | { type: "cards"; title?: string; intro?: string; items: { title: string; copy: string }[] }
  | { type: "table"; title?: string; intro?: string; columns: string[]; rows: string[][] }
  | { type: "steps"; title?: string; items: { title: string; copy: string }[] }
  | { type: "pillars"; title?: string; items: { label: string; copy: string }[] }
  | {
      type: "contact";
      email: string;
      phone?: string;
      welfare?: string;
      socials: { label: string; handle: string; href: string }[];
      address: string;
      mapEmbed: string;
    }
  | { type: "form"; title: string; intro?: string; subjects?: string[]; submitLabel: string; mailto: string };

export type PageHero = { src: string; alt: string; blurDataURL: string };

export type MarketingPage = {
  slug: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  hero: PageHero;
  blocks: Block[];
};

export const mapEmbedSrc =
  "https://www.google.com/maps?q=Darebin%20International%20Sports%20Centre%2C%20281%20Darebin%20Road%2C%20Thornbury%20VIC%203071&output=embed";
```

- [ ] **Step 2: Rewrite the `pages` array with real content**

Replace the entire `export const pages: MarketingPage[] = [ ... ];` array with the following. Hero blurs are copied verbatim from `public/images/manifest.json`. "to be confirmed" is intentional.

```ts
export const pages: MarketingPage[] = [
  {
    slug: "the-club",
    navLabel: "The Club",
    eyebrow: "Our Story",
    title: "Football for all, played the Astra way.",
    intro:
      "Astra United FC is a community-focused football club in Melbourne's north, known for technical excellence, sportsmanship, and the Astra Way: football for all, played the right way.",
    hero: {
      src: "/images/ground/astra-ground-wide-sky-1280.webp",
      alt: "Wide establishing shot of the Astra United Darebin pitch with blue sky, clouds, and floodlights",
      blurDataURL:
        "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAABQBACdASoQAB0APu1iqU2ppaOiMAgBMB2JZgCdACHwp9mDYDRqFT96VhYAAP6z4nrT7qYAdQc++QcVOP0fNj8+Y7CcCZ9j5Ag6IhhLBrl2nDa3N30OU8lU/IWd6GZ0yio1pEEepa9E3b2bcJSsn7ApfcljL5J5VMIUaf7PXfCH/VcNY5QlgAAA"
    },
    blocks: [
      {
        type: "prose",
        title: "Our story & mission",
        copy:
          "Founded with a vision to elevate local football, Astra grew from a small group of passionate players and coaches into a structured, multi-team club. Our mission is a safe, inclusive, professional environment where players of all ages develop their skills, build friendships, and embrace the competitive spirit of the game - we don't just coach players, we mentor the next generation of community leaders.",
        bullets: [
          "Professional standards at grassroots level",
          "A mission to develop players and community leaders",
          "Proudly serving families across Melbourne's north"
        ]
      },
      {
        type: "prose",
        title: "The trophy cabinet",
        copy:
          "Astra's honours and club awards will be celebrated here as the club's competitive record grows.",
        bullets: [
          "League and cup honours - to be confirmed",
          "Runners-up and finals appearances - to be confirmed",
          "Club of the Year recognition - to be confirmed"
        ]
      },
      {
        type: "cards",
        title: "Committee & staff",
        intro:
          "Astra is powered by dedicated volunteers and qualified professionals. All lead coaches hold recognised Football Australia coaching qualifications and current Working With Children Checks.",
        items: [
          { title: "Club Chairperson", copy: "Club leadership and direction - name to be confirmed." },
          { title: "Club Secretary", copy: "Administration and governance - name to be confirmed." },
          { title: "Treasurer", copy: "Club finances and membership - name to be confirmed." },
          { title: "Head of Academy", copy: "Youth development and coaching - name to be confirmed." },
          { title: "Senior First Team Manager", copy: "Senior program - name to be confirmed." },
          { title: "Welfare Officer", copy: "Your first point of contact for player wellbeing - name to be confirmed." }
        ]
      },
      {
        type: "prose",
        title: "Governance & safeguarding",
        copy:
          "Astra operates with transparency and accountability, aligned with Football Australia and local council regulations. The safety of our youth players is our absolute priority.",
        bullets: [
          "Club constitution and operating rules",
          "Safeguarding & welfare policy (Football Australia aligned)",
          "AGM minutes and member updates"
        ]
      },
      {
        type: "prose",
        title: "Facilities & match-day",
        copy:
          "We train and play at Darebin International Sports Centre (281 Darebin Road, Thornbury VIC 3071), with well-maintained pitches, on-site parking, and match-day amenities. Please park within designated bays and follow our match-day stewards to respect local residents.",
        bullets: [
          "Darebin International Sports Centre, Thornbury",
          "Ample on-site parking; match-day stewards",
          "Toilets and changing facilities during scheduled windows"
        ]
      }
    ]
  },
  {
    slug: "teams",
    navLabel: "Teams",
    eyebrow: "Pathways",
    title: "From Mini-Kickers to senior football.",
    intro:
      "Astra's pathway supports boys, girls, youth players, U23s, and senior squads - a clear route from first touch to first team.",
    hero: {
      src: "/images/match/astra-match-aerial-control-1280.webp",
      alt: "Astra United player demonstrating aerial ball control on the touchline at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAABwAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JQAALy3lD0RzM42AA/sNBPUfSWcutepFcBy6yiESNMgjHMmx/olDKBxr2bDH2YhCb4AXi7l2BRzW9s9iQ/QnXwZdaLwxCaZ4RRD4YwAA="
    },
    blocks: [
      {
        type: "cards",
        title: "Senior teams",
        intro:
          "Our senior program shows the club's philosophy at a competitive level - and many senior players have progressed through our own Youth Academy.",
        items: [
          { title: "Men's First Team", copy: "Competing in the Victorian league system - a blend of experienced heads and emerging talent." },
          { title: "Women's First Team", copy: "A core part of our identity - growing, competitive, and inspiring the next generation." },
          { title: "Under-23s", copy: "The bridge between youth and senior football, refining technical and tactical discipline." }
        ]
      },
      {
        type: "cards",
        title: "Youth Academy",
        intro:
          "Based at Darebin, the Academy gives boys and girls from U6 to U18 a safe, structured environment built on development over results - technical excellence, game intelligence, and social growth.",
        items: [
          { title: "Mini-Kickers (U6-U8)", copy: "Fun-based introduction to the basics of football." },
          { title: "Junior Academy (U9-U12)", copy: "Small-sided games focused on technical foundation." },
          { title: "Youth Development (U13-U18)", copy: "Transition to 11-a-side football and tactical awareness." }
        ]
      },
      {
        type: "prose",
        title: "Fixtures & results",
        copy:
          "Upcoming fixtures, latest results, and league standings will live here - check match locations and kit colours before kick-off. Locations can change with the weather, so check the home-page pitch status on match mornings.",
        bullets: [
          "Upcoming fixtures and kick-off details - to be confirmed",
          "Latest results and match summaries - to be confirmed",
          "League table and venue links - to be confirmed"
        ]
      }
    ]
  },
  {
    slug: "join-us",
    navLabel: "Join Us",
    eyebrow: "Registration",
    title: "Join the Astra family.",
    intro:
      "Joining Astra is straightforward, whether you're returning or playing with us for the first time. The 2026 season runs March to September, with pre-season from February.",
    hero: {
      src: "/images/academy/astra-academy-training-wide-1280.webp",
      alt: "Astra United youth academy players in training bibs during a drill session at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAsAA4BaJbAAAxZbZ/GZAAD+1z/ZYKqmtnVc6okA+qCnDfoYAtrg2zI4XIaE2KYUl2ZAO/KqM+alyLiJIxqwefcpOOsovAA="
    },
    blocks: [
      {
        type: "table",
        title: "Membership fees (2026 season)",
        intro:
          "We strive to keep football affordable while maintaining high standards of coaching and facilities. Fees cover league affiliations, insurance, pitch hire, Football Australia-aligned coaching, and kit maintenance.",
        columns: ["Membership", "Ages", "Season fee"],
        rows: [
          ["Academy members", "U6-U12", "To be confirmed"],
          ["Youth members", "U13-U18", "To be confirmed"],
          ["Senior members", "Open age", "To be confirmed"]
        ]
      },
      {
        type: "steps",
        title: "How to register",
        items: [
          { title: "Complete the online form", copy: "Fill in our secure digital registration form for the 2026 season." },
          { title: "Upload documentation", copy: "New players upload a proof-of-age document (birth certificate or passport) for league registration." },
          { title: "Make payment", copy: "Pay in full or via monthly direct-debit instalments." }
        ]
      },
      {
        type: "pillars",
        title: "What we look for at trials",
        items: [
          { label: "Technical", copy: "Ball control and passing range." },
          { label: "Tactical", copy: "Understanding of the game and positioning." },
          { label: "Physical", copy: "Speed, agility, and balance." },
          { label: "Character", copy: "Work rate, respect, and a team-first attitude." }
        ]
      },
      {
        type: "cards",
        title: "Volunteers - our off-pitch heroes",
        intro:
          "Astra is community-run. All volunteers working with children must meet Working With Children requirements.",
        items: [
          { title: "Team managers & coaches", copy: "Lead a squad and develop young talent (qualifications supported by the club)." },
          { title: "Match-day marshals", copy: "Help with parking and pitch-side setup for a safe environment." },
          { title: "The BBQ crew", copy: "Keep players and fans fed during home tournaments and gala days." },
          { title: "Referees", copy: "Qualified officials (or those wishing to train) for our junior fixtures." },
          { title: "Media volunteers", copy: "Capture photos and videos for our social channels." }
        ]
      },
      {
        type: "form",
        title: "Register your interest",
        intro: "Send us your details and our registrar will be in touch about registration and trials.",
        subjects: ["Player registration", "Open trials", "Volunteering"],
        submitLabel: "Send registration enquiry",
        mailto: "info@astraunitedfootballclub.com"
      }
    ]
  },
  {
    slug: "news-media",
    navLabel: "News",
    eyebrow: "News & Media",
    title: "From the training ground to the touchline.",
    intro:
      "Match reports, club announcements, player spotlights, photos, and events from across the Astra community.",
    hero: {
      src: "/images/community/astra-community-team-photo-1280.webp",
      alt: "Astra United FC youth squad and coaching staff posing for a team photo at Darebin",
      blurDataURL:
        "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsAA4BaJaAC7AEO51NfsyAA/uhR8gOKYM+H/sHOAha6twOxn++SjZ011xmUaPcrFeIDsIUFYFIA3e9Pz9z6rxA4narSxexzNwWSAAA="
    },
    blocks: [
      {
        type: "cards",
        title: "Latest news",
        intro: "Your official source for club updates, match reports, and community news.",
        items: [
          { title: "Match reports", copy: "Weekly breakdowns of our senior and academy performances." },
          { title: "Club announcements", copy: "Kit launches, holiday-camp dates, and registration deadlines." },
          { title: "Player spotlights", copy: "Celebrating individual achievements and milestones in the Astra family." }
        ]
      },
      {
        type: "cards",
        title: "Photo & video gallery",
        intro: "Explore our teams in action throughout the season. A full gallery is coming soon.",
        items: [
          { title: "Match-day highlights", copy: "High-energy shots from our recent league fixtures." },
          { title: "Academy days", copy: "The fun and focus of our youth development sessions." },
          { title: "Celebrations", copy: "Trophies, team huddles, and post-match smiles." }
        ]
      },
      {
        type: "cards",
        title: "Events calendar",
        intro: "Our club is active all year round.",
        items: [
          { title: "Annual presentation night", copy: "Celebrating the season's successes with players and families." },
          { title: "Summer football gala", copy: "Our flagship community tournament for all age groups." },
          { title: "Charity fundraisers", copy: "Quiz nights, sponsored walks, and community support events." },
          { title: "School-holiday camps", copy: "Professional coaching to keep kids active during school breaks." }
        ]
      }
    ]
  },
  {
    slug: "sponsors",
    navLabel: "Sponsors",
    eyebrow: "Partners",
    title: "Support grassroots football in Melbourne's north.",
    intro:
      "Astra welcomes businesses who want visibility while investing in youth development, coaching, facilities, and community football in Melbourne's north.",
    hero: {
      src: "/images/kit/astra-kit-ball-1280.webp",
      alt: "Astra United Academy jersey beside the official match ball at the Darebin ground",
      blurDataURL:
        "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADwAwCdASoQABgAPu1iqk2ppaQiMAgBMB2JYgCdOUAAhXd8KMmZvxcAANc0QbnWA1e8eb71ZbYLPRtgKeFJOG3r962snakr3n7F2TwlfVFXyug2uWIbf+6UsjPW0qj8Ves/Qn88QAA="
    },
    blocks: [
      {
        type: "prose",
        title: "More than a logo on a shirt",
        copy:
          "At Astra, football is the heartbeat of the community. Maintaining high-quality pitches, providing Football Australia-aligned coaching, and keeping membership affordable is only possible through our partners. When you support Astra you invest in the health, development, and future of young people across Melbourne's north."
      },
      {
        type: "cards",
        title: "Partnership tiers",
        items: [
          { title: "Principal Club Partner", copy: "Our lead sponsor, supporting the club across all senior and academy levels." },
          { title: "Gold Partners", copy: "Key supporters of our match-day kits and facility maintenance." },
          { title: "Community Supporters", copy: "Local businesses helping us grow our grassroots programmes." }
        ]
      },
      {
        type: "table",
        title: "Sponsorship packages",
        intro: "Tiered packages to suit any business, with bespoke options available. All placements are subject to venue and council guidelines.",
        columns: ["Package", "What's included"],
        rows: [
          ["Main Kit Sponsor", "Front-of-shirt branding on match-day kits, featured website placement, social spotlight."],
          ["Training Wear Sponsor", "Logo on all player training gear and tracksuits."],
          ["Pitch-side Partner", "High-visibility perimeter signage at home fixtures (subject to approval)."],
          ["Player Pathway Sponsor", "Directly fund coaching certifications and equipment for the Youth Academy."],
          ["Match Ball Sponsor", "Recognition on our Match Day graphics for every home game."]
        ]
      },
      {
        type: "form",
        title: "Enquire about sponsorship",
        intro: "Tell us about your business and we'll send the 2026 sponsorship prospectus and tailored options.",
        subjects: ["Sponsorship enquiry"],
        submitLabel: "Enquire about sponsorship",
        mailto: "info@astraunitedfootballclub.com"
      }
    ]
  },
  {
    slug: "contact",
    navLabel: "Contact",
    eyebrow: "Contact",
    title: "Get in touch with Astra United FC.",
    intro:
      "Questions about joining, sponsorship, volunteering, media, or safeguarding? We'd love to hear from you and aim to respond within 48 business hours.",
    hero: {
      src: "/images/ground/astra-ground-player-pitch-1280.webp",
      alt: "Astra United player on the Darebin pitch with goalposts, floodlights, and open sky",
      blurDataURL:
        "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAAAQBACdASoQABwAPu1iqk4ppaQiMAgBMB2JZgCdAYuu3967A0EcV+3wAAD+31caLlVyArnNznOh98UjbQR0g5rNnNy7nZlXIllAMTcwtFjK9smeMCXQt/rYAjGPGfOo5gzOpQBRyvcEJTEK2dMmJzbsSOZqKRaOocQdL0Vxx8oAnHGD3ECAnVxR8hbjOYs1QLgAAA"
    },
    blocks: [
      {
        type: "form",
        title: "Send us a message",
        intro: "We aim to respond to all enquiries within 48 business hours.",
        subjects: ["General enquiry", "Player registration & trials", "Sponsorship opportunities", "Media & press", "Volunteering"],
        submitLabel: "Send message",
        mailto: "info@astraunitedfootballclub.com"
      },
      {
        type: "contact",
        email: "info@astraunitedfootballclub.com",
        phone: "To be confirmed",
        welfare: "Welfare Officer contact - to be confirmed",
        socials: socialLinks,
        address: "Darebin International Sports Centre, 281 Darebin Road, Thornbury VIC 3071",
        mapEmbed: mapEmbedSrc
      },
      {
        type: "prose",
        title: "Before you get in touch",
        copy: "Your answer might be a click away.",
        bullets: [
          "Where do we train? Darebin International Sports Centre, Thornbury",
          "How much are membership fees? See the Join Us page",
          "Are the pitches open today? Check the pitch status on our home page"
        ]
      }
    ]
  }
];
```

NOTE: this block references `socialLinks` and `mapEmbedSrc`, which are declared earlier in the file (socialLinks already exists; `mapEmbedSrc` added in Step 1). Ensure the `pages` array appears **after** both declarations. Move the `clubContact`/`socialLinks` exports above `pages` if they are currently below it.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS. If `[slug]/page.tsx` errors because `page.sections` no longer exists, that's expected — it is rewritten in Task 6. To keep the build green between tasks, this is acceptable since we verify at the end; but if you want green now, proceed to Task 6 before running the app.

- [ ] **Step 4: Commit**

```bash
git add src/lib/site-data.ts
git commit -m "feat: typed block content model + real inner-page content"
```

---

## Task 2: Page integrity test (`site-data.test.ts`)

**Files:**
- Create: `src/lib/site-data.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, expect, it } from "vitest";
import { pages, getPageBySlug } from "./site-data";

describe("marketing pages", () => {
  it("every page has a hero image and at least one block", () => {
    for (const page of pages) {
      expect(page.hero.src).toMatch(/^\/images\/.+\.webp$/);
      expect(page.blocks.length).toBeGreaterThan(0);
    }
  });

  it("getPageBySlug finds known pages and rejects unknown", () => {
    expect(getPageBySlug("the-club")?.navLabel).toBe("The Club");
    expect(getPageBySlug("contact")?.slug).toBe("contact");
    expect(getPageBySlug("does-not-exist")).toBeUndefined();
  });

  it("every form block mails the club address", () => {
    const forms = pages.flatMap((p) => p.blocks).filter((b) => b.type === "form");
    expect(forms.length).toBeGreaterThan(0);
    for (const f of forms) {
      if (f.type === "form") expect(f.mailto).toBe("info@astraunitedfootballclub.com");
    }
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/lib/site-data.test.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/site-data.test.ts
git commit -m "test: inner-page block integrity"
```

---

## Task 3: PageHero + simple block components

**Files:**
- Create: `src/components/blocks/PageHero.tsx`, `ProseBlock.tsx`, `CardsBlock.tsx`, `StepsBlock.tsx`, `PillarsBlock.tsx`

- [ ] **Step 1: PageHero**

Create `src/components/blocks/PageHero.tsx`:

```tsx
import Image from "next/image";
import type { PageHero as PageHeroData } from "@/src/lib/site-data";

type Props = { eyebrow: string; title: string; intro: string; hero: PageHeroData };

export function PageHero({ eyebrow, title, intro, hero }: Props) {
  return (
    <section className="relative isolate flex min-h-[60svh] items-end overflow-hidden px-5 pb-16 pt-32 text-white">
      <Image
        src={hero.src}
        alt=""
        fill
        priority
        placeholder="blur"
        blurDataURL={hero.blurDataURL}
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-astra-ink via-astra-ink/80 to-astra-ink/55" aria-hidden="true" />
      <div className="absolute inset-y-0 left-0 -z-10 w-2/5 skew-x-[-18deg] bg-astra-red/15 blur-2xl" aria-hidden="true" />
      <div className="container-wide">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-astra-red" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-astra-gold">{eyebrow}</span>
        </div>
        <h1 className="crest-type mt-5 max-w-5xl text-5xl leading-[0.9] sm:text-7xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">{intro}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: ProseBlock**

Create `src/components/blocks/ProseBlock.tsx`:

```tsx
import { Check } from "lucide-react";

type Props = { title: string; copy: string; bullets?: string[] };

export function ProseBlock({ title, copy, bullets }: Props) {
  return (
    <div className="container-wide grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <h2 className="crest-type text-3xl leading-[0.95] text-white sm:text-4xl">{title}</h2>
      <div>
        <p className="max-w-2xl text-base leading-7 text-white/76 sm:text-lg">{copy}</p>
        {bullets ? (
          <ul className="mt-6 grid gap-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm leading-6 text-white/80">
                <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-astra-red" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: CardsBlock**

Create `src/components/blocks/CardsBlock.tsx`:

```tsx
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; intro?: string; items: { title: string; copy: string }[] };

export function CardsBlock({ title, intro, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Astra United" title={title} copy={intro} inverse /> : null}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="card-dark p-6">
            <h3 className="text-xl font-black text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/72">{item.copy}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: StepsBlock**

Create `src/components/blocks/StepsBlock.tsx`:

```tsx
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; items: { title: string; copy: string }[] };

export function StepsBlock({ title, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Step by step" title={title} inverse /> : null}
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.title} className="card-dark p-6">
            <span className="crest-type flex h-10 w-10 items-center justify-center rounded-full bg-astra-red text-lg text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 5: PillarsBlock**

Create `src/components/blocks/PillarsBlock.tsx`:

```tsx
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; items: { label: string; copy: string }[] };

export function PillarsBlock({ title, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="What we look for" title={title} inverse /> : null}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="card-dark p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Typecheck + commit**

Run: `npm run typecheck`
Expected: PASS.

```bash
git add src/components/blocks/PageHero.tsx src/components/blocks/ProseBlock.tsx src/components/blocks/CardsBlock.tsx src/components/blocks/StepsBlock.tsx src/components/blocks/PillarsBlock.tsx
git commit -m "feat: page hero + prose/cards/steps/pillars block components"
```

---

## Task 4: TableBlock + ContactBlock + ContactForm

**Files:**
- Create: `src/components/blocks/TableBlock.tsx`, `ContactBlock.tsx`, `ContactForm.tsx`

- [ ] **Step 1: TableBlock**

Create `src/components/blocks/TableBlock.tsx`:

```tsx
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; intro?: string; columns: string[]; rows: string[][] };

export function TableBlock({ title, intro, columns, rows }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Astra United" title={title} copy={intro} inverse /> : null}
      <div className="card-dark mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/12">
              {columns.map((c) => (
                <th key={c} className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-astra-gold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-white/8 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-5 py-4 align-top leading-6 ${ci === 0 ? "font-black text-white" : "text-white/72"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ContactBlock**

Create `src/components/blocks/ContactBlock.tsx`:

```tsx
import { Facebook, Instagram, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";

type Social = { label: string; handle: string; href: string };
type Props = {
  email: string;
  phone?: string;
  welfare?: string;
  socials: Social[];
  address: string;
  mapEmbed: string;
};

const icons: Record<string, typeof Instagram> = { Instagram, Facebook };

export function ContactBlock({ email, phone, welfare, socials, address, mapEmbed }: Props) {
  return (
    <div className="container-wide grid gap-8 lg:grid-cols-2">
      <div className="card-dark p-7 sm:p-8">
        <h2 className="crest-type text-2xl text-white">Direct contact</h2>
        <ul className="mt-6 grid gap-4 text-sm text-white/80">
          <li>
            <a href={`mailto:${email}`} className="flex items-center gap-3 transition hover:text-white">
              <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" /> {email}
            </a>
          </li>
          {phone ? (
            <li className="flex items-center gap-3">
              <Phone aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" /> {phone}
            </li>
          ) : null}
          {welfare ? (
            <li className="flex items-center gap-3">
              <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" /> {welfare}
            </li>
          ) : null}
          <li className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-astra-red" /> {address}
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {socials.map((s) => {
            const Icon = icons[s.label];
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:text-white"
              >
                {Icon ? <Icon aria-hidden="true" className="h-4 w-4 text-astra-gold" /> : <span className="font-black text-astra-gold">X</span>}
                {s.handle}
              </a>
            );
          })}
        </div>
      </div>
      <div className="card-dark overflow-hidden">
        <iframe
          title="Astra United home ground map - Darebin International Sports Centre"
          src={mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-[320px] w-full border-0"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ContactForm (client, mailto)**

Create `src/components/blocks/ContactForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title: string; intro?: string; subjects?: string[]; submitLabel: string; mailto: string };

export function ContactForm({ title, intro, subjects, submitLabel, mailto }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects?.[0] ?? "General enquiry");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${mailto}?subject=${encodeURIComponent(`[Astra United] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const field = "w-full rounded border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-astra-gold";

  return (
    <div className="container-wide max-w-3xl">
      <SectionHeader eyebrow="Get in touch" title={title} copy={intro} inverse />
      <form onSubmit={onSubmit} className="card-dark mt-8 grid gap-4 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required aria-label="Your name" />
          <input className={field} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email address" />
        </div>
        {subjects && subjects.length > 1 ? (
          <select className={field} value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
            {subjects.map((s) => (
              <option key={s} value={s} className="bg-astra-ink">
                {s}
              </option>
            ))}
          </select>
        ) : null}
        <textarea className={`${field} min-h-[140px]`} placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} required aria-label="Your message" />
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded bg-astra-red px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700">
          {submitLabel}
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-xs text-white/48">This opens your email app addressed to the club. We aim to respond within 48 business hours.</p>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `npm run typecheck`
Expected: PASS.

```bash
git add src/components/blocks/TableBlock.tsx src/components/blocks/ContactBlock.tsx src/components/blocks/ContactForm.tsx
git commit -m "feat: table, contact, and mailto form block components"
```

---

## Task 5: BlockRenderer

**Files:**
- Create: `src/components/blocks/BlockRenderer.tsx`

- [ ] **Step 1: Create the renderer**

Create `src/components/blocks/BlockRenderer.tsx`:

```tsx
import type { Block } from "@/src/lib/site-data";
import { ProseBlock } from "@/src/components/blocks/ProseBlock";
import { CardsBlock } from "@/src/components/blocks/CardsBlock";
import { TableBlock } from "@/src/components/blocks/TableBlock";
import { StepsBlock } from "@/src/components/blocks/StepsBlock";
import { PillarsBlock } from "@/src/components/blocks/PillarsBlock";
import { ContactBlock } from "@/src/components/blocks/ContactBlock";
import { ContactForm } from "@/src/components/blocks/ContactForm";

function renderBlock(block: Block) {
  switch (block.type) {
    case "prose":
      return <ProseBlock title={block.title} copy={block.copy} bullets={block.bullets} />;
    case "cards":
      return <CardsBlock title={block.title} intro={block.intro} items={block.items} />;
    case "table":
      return <TableBlock title={block.title} intro={block.intro} columns={block.columns} rows={block.rows} />;
    case "steps":
      return <StepsBlock title={block.title} items={block.items} />;
    case "pillars":
      return <PillarsBlock title={block.title} items={block.items} />;
    case "contact":
      return (
        <ContactBlock
          email={block.email}
          phone={block.phone}
          welfare={block.welfare}
          socials={block.socials}
          address={block.address}
          mapEmbed={block.mapEmbed}
        />
      );
    case "form":
      return <ContactForm title={block.title} intro={block.intro} subjects={block.subjects} submitLabel={block.submitLabel} mailto={block.mailto} />;
  }
}

export function BlockRenderer({ block, index }: { block: Block; index: number }) {
  const band = index % 2 === 0 ? "band-fog" : "band-deep";
  return <section className={`section-band ${band}`}>{renderBlock(block)}</section>;
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck`
Expected: PASS (the `switch` is exhaustive over the `Block` union).

```bash
git add src/components/blocks/BlockRenderer.tsx
git commit -m "feat: block renderer with alternating dark bands"
```

---

## Task 6: Rewrite the `[slug]` page

**Files:**
- Modify: `app/[slug]/page.tsx` (full replace)

- [ ] **Step 1: Replace the file**

Replace the entire contents of `app/[slug]/page.tsx` with:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/src/components/blocks/PageHero";
import { BlockRenderer } from "@/src/components/blocks/BlockRenderer";
import { getPageBySlug, pages } from "@/src/lib/site-data";

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = getPageBySlug(params.slug);
  if (!page) return {};
  return { title: page.navLabel, description: page.intro };
}

export default function MarketingPage({ params }: PageProps) {
  const page = getPageBySlug(params.slug);
  if (!page) notFound();

  return (
    <main id="main-content" className="bg-astra-ink">
      <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} hero={page.hero} />
      {page.blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} index={index} />
      ))}
      <section className="section-band band-deep">
        <div className="container-wide flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-astra-gold">Next step</p>
            <h2 className="crest-type mt-2 text-4xl text-white">Talk to the club.</h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-red-700"
          >
            Contact Astra
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no more `page.sections` references anywhere).

- [ ] **Step 3: Commit**

```bash
git add app/[slug]/page.tsx
git commit -m "feat: render inner pages from blocks on the dark theme"
```

---

## Task 7: Rewrite the shop page (dark)

**Files:**
- Modify: `app/shop/page.tsx` (full replace)

- [ ] **Step 1: Replace the file**

Replace the entire contents of `app/shop/page.tsx` with:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/src/components/blocks/PageHero";
import { CardsBlock } from "@/src/components/blocks/CardsBlock";

export const metadata: Metadata = {
  title: "Club Shop",
  description: "Official Astra United FC club shop - kits, training apparel, and supporter wear coming soon."
};

const kitCards = [
  { title: "Player bundles", copy: "Everything a new signing needs - home/away jerseys, shorts, and socks." },
  { title: "Training apparel", copy: "Astra-branded quarter-zips, rain jackets, and training tees." },
  { title: "Customisation", copy: "Add your squad number or initials to select items." }
];

const fanCards = [
  { title: "Astra lifestyle", copy: "High-quality hoodies, beanies, and scarves for cold morning kick-offs." },
  { title: "Gifts & accessories", copy: "Branded water bottles, gym bags, and car stickers for the ultimate fan." },
  { title: "Member discounts", copy: "Astra members may be eligible for seasonal discounts on selected items." }
];

export default function ShopPage() {
  return (
    <main id="main-content" className="bg-astra-ink">
      <PageHero
        eyebrow="Coming soon"
        title="Gear up for game day."
        intro="Show your colours with the official Astra United range - professional match-day kits for our players and comfortable sideline wear for our supporters."
        hero={{
          src: "/images/kit/astra-kit-ball-1280.webp",
          alt: "Astra United Academy jersey beside the official match ball at the Darebin ground",
          blurDataURL:
            "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADwAwCdASoQABgAPu1iqk2ppaQiMAgBMB2JYgCdOUAAhXd8KMmZvxcAANc0QbnWA1e8eb71ZbYLPRtgKeFJOG3r962snakr3n7F2TwlfVFXyug2uWIbf+6UsjPW0qj8Ves/Qn88QAA="
        }}
      />
      <section className="section-band band-fog">
        <CardsBlock title="Official match & training kit" intro="Built for the pitch and every session." items={kitCards} />
      </section>
      <section className="section-band band-deep">
        <CardsBlock title="Supporter & fan wear" intro="Represent the club from the sideline." items={fanCards} />
      </section>
      <section className="section-band band-fog">
        <div className="container-wide max-w-3xl">
          <div className="card-dark p-8 text-white">
            <h2 className="crest-type text-2xl">Online store opening soon</h2>
            <p className="mt-4 text-base leading-7 text-white/76">
              The full club shop is on the way. In the meantime, contact the club directly for any kit-related enquiries.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-astra-red">
              Contact the club
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `npm run typecheck`
Expected: PASS.

```bash
git add app/shop/page.tsx
git commit -m "feat: dark shop page using page hero + cards"
```

---

## Task 8: Verification & preview deploy

**Files:** none

- [ ] **Step 1: Full test + typecheck**

Run: `npx vitest run` then `npm run typecheck`
Expected: all tests PASS (touchline + path + site-data), typecheck clean.

- [ ] **Step 2: Push branch for preview**

```bash
git push personal inner-pages-dark
```
Open `astra-united-git-inner-pages-dark-mazdaks-projects-dffe9641.vercel.app` (auth-protected; the client reviews). Verify each page: dark theme, hero photo, blocks render, table scrolls on mobile, contact map loads, form opens an email, faces visible, reduced-motion OK.

- [ ] **Step 3: Hand back to client for review before production.**

---

## Self-Review

**Spec coverage:** block model (Task 1) ✓; components incl. map + mailto form (Tasks 3-5) ✓; `[slug]` renderer (Task 6) ✓; shop (Task 7) ✓; per-page content for all six pages (Task 1) ✓; honesty "to be confirmed" preserved ✓; testing (Task 2, 8) ✓; non-goals respected (no gallery/backend/store/sub-routes) ✓.

**Placeholder scan:** "to be confirmed" is intentional page content, not a plan gap. All component/code blocks are complete. No TODO/TBD in instructions.

**Type consistency:** `Block` union (Task 1) matches every component's props and the `BlockRenderer` switch (Task 5) and `renderBlock` is exhaustive. `PageHero` data type reused by `PageHero` component (Task 3) and shop (Task 7). `socialLinks`/`mapEmbedSrc` declared before `pages` (Task 1 Step 2 note). Form `mailto` constant matches the test (Task 2).
