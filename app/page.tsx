import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Crown,
  ExternalLink,
  GraduationCap,
  Hand,
  ShieldCheck,
  Trophy
} from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { HeroIntro } from "@/src/components/HeroIntro";
import { BrandMarquee } from "@/src/components/BrandMarquee";
import { FlowReveal, PopCard } from "@/src/components/FlowReveal";
import { Touchline } from "@/src/components/Touchline";
import { SectionHeader } from "@/src/components/SectionHeader";
import { FounderFeature } from "@/src/components/FounderFeature";
import { FutureOrbit } from "@/src/components/FutureOrbit";
import { ProgramPillarsRail } from "@/src/components/ProgramPillarsRail";
import { StandardsBoard } from "@/src/components/StandardsBoard";
import { SponsorMarquee } from "@/src/components/SponsorMarquee";
import {
  comingSoon,
  comingSoonIntro,
  developmentModel,
  developmentPillars,
  trustStandards,
  welcome
} from "@/src/lib/content/home";
import { SpotlightSection } from "@/src/components/content/SpotlightSection";
import { NewsSection } from "@/src/components/content/NewsSection";
import { ScheduleSection } from "@/src/components/content/ScheduleSection";
import { SlotImage } from "@/src/components/content/SlotImage";
import { SubscribeBox } from "@/src/components/content/SubscribeBox";
import type { SlotKey } from "@/src/lib/content/photo-slots";


// One icon per initiative, in the deck's order. It prints these as emoji
// (brain, crown, glove, chart); these are the lucide equivalents. GraduationCap
// rather than Brain for the Learning Centre — Brain already carries the
// Psychological pillar in §4, and reusing it would imply a link that is not there.
const SOON_ICONS = [GraduationCap, Crown, Hand, BarChart3] as const;

const sponsorTiers = [
  {
    title: "Principal Club Partner",
    copy: "Lead the club's identity with naming presence across kit, ground signage, and digital."
  },
  {
    title: "Match & training kit",
    copy: "Main kit, training wear, and match-ball partnerships seen every game day and session."
  },
  {
    title: "Community supporter",
    copy: "Pitch-side and player-pathway packages for local businesses backing youth football."
  }
];

// The Visual Pathway Grid (Revised homepage architecture §5). Five blocks, one
// per phase, laid out as full-width rows in the Club Essentials treatment the
// deck asks for — but each keeps a photo, because §5's designer note also asks
// for "high-quality imagery behind each block". Age brackets carry the deck's en
// dashes verbatim.
//
// Two programmes leave this list: Astra Future Stars (3-5) is dropped, and Astra
// Evolution Girls moves to a "coming soon" line in §8. Two arrive: High
// Performance Track and Private Football Sessions. No photo slot is added or
// removed — the five existing ones are re-pointed at the phase each photo
// actually suits, so the admin Photos tab and the slot-key test are unchanged.
const pathwayBlocks: {
  age: string;
  title: string;
  copy: string;
  cta: string;
  slot: SlotKey;
  href: string;
}[] = [
  {
    age: "U5–U7",
    title: "Astra Foundation Hub",
    copy: "Igniting a lifelong passion for soccer. This track introduces structured ball mastery, technical development, and positive teamwork across Melbourne suburbs.",
    cta: "Explore Program",
    // the mini-kickers photo — the youngest group we have, so it fits U5-U7
    // better here than it did on the dropped 3-5 card.
    slot: "home-academy-mini",
    href: "/teams"
  },
  {
    age: "U8–U10",
    title: "Astra Youth Academy",
    copy: "Our flagship player development stream. Intensive technical training and tactical applications designed to prepare players for competitive environments.",
    cta: "Explore Program",
    slot: "home-academy-junior",
    href: "/teams"
  },
  {
    age: "U11–U13",
    title: "Next-Gen Performance Program",
    copy: "Advanced performance squads engineered for accelerated development, preparing elite athletes for representative league fixtures and senior selection.",
    cta: "Explore Track",
    slot: "home-academy-youth",
    href: "/teams"
  },
  {
    age: "U14–U15",
    title: "High Performance Track",
    copy: "Tailored for advanced athletes focusing on deep match understanding, rapid speed of play, tactical decision-making, and physical readiness for elite competition.",
    cta: "Explore Track",
    // the coaching-huddle shot: the most senior-looking group in the library.
    slot: "home-program-performance",
    href: "/teams"
  },
  {
    age: "All ages",
    title: "Private Football Sessions",
    copy: "Tailored 1-on-1 and small group programs focusing on individual technical improvements, addressing training gaps, enhancing physical readiness, and refining next-gen playing styles.",
    cta: "Book Private Session",
    // the single-player shot from the girls programme: a lone player with a ball
    // reads as 1-on-1, and it keeps that photo (produced in Round 5b) on the page.
    slot: "home-program-girls",
    // no trials/booking page exists; /contact is the enquiry route. Re-point when
    // a booking page exists.
    href: "/contact"
  }
];

// Club Essentials — the Quick Navigation Matrix (Revised homepage architecture
// §7). Cut from four items to three and all renamed, per the deck. It also takes
// the CARD design the pathway grid gave up, which is the other half of the deck's
// swap, so each item now carries a photo and no longer needs an icon.
const clubEssentials: { title: string; copy: string; cta: string; href: string; slot: SlotKey }[] = [
  {
    title: "Meet the Club",
    copy: "Discover our club history, leadership team, and our growth vision across Melbourne suburbs.",
    cta: "About Astra United",
    href: "/the-club",
    slot: "home-essential-club"
  },
  {
    title: "Trials & Fees",
    copy: "Stay informed on upcoming youth football trials, seasonal club membership fees, and step-by-step registration.",
    cta: "Trial & Fee Info",
    href: "/join-us",
    slot: "home-essential-trials"
  },
  {
    title: "Fixtures & Events",
    copy: "Access the Training Calendar, Academy Events, Program Schedule, and Private Sessions.",
    cta: "View Event Calendar",
    // the live "This Week at Astra" band further down IS the training calendar
    // and events rail, so this routes there rather than off to another page.
    href: "/#schedule",
    slot: "home-essential-fixtures"
  }
];

export default function Home() {
  return (
    <main id="main-content">
      <HeroIntro />
      <BrandMarquee />
      <Touchline>
        {/* Club Spotlight (top) — admin event posts under the hero; absent when none live */}
        <SpotlightSection placement="top" />

        {/* 0 — Welcome to Astra United FC, "The Brand Philosophy" (Revised
            homepage architecture §3): the first standalone section after the hero
            motion. Crest headline with the red accent, the two body paragraphs,
            and the academy training photo. The deck specs no "Small Label" for
            this section, so there is no gold subhead line here (§4 and §5 do get
            one) — the headline carries the band on its own.

            BAND NOTE: this flipped deep -> fog when §4 was inserted below it.
            Bands alternate, so adding a section anywhere shifts the parity of
            every band on one side of it. Flipping the ONE section above the
            insertion was the whole fix — flipping everything below would have
            meant touching NewsSection and ScheduleSection, which carry their band
            internally, and would have moved seven approved sections onto
            backgrounds they were not designed against. */}
        <FlowReveal className="section-band band-deep">
          <div
            data-touchline-node
            className="container-wide grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch"
          >
            <div>
              <h2 className="crest-type type-h2 text-white">
                Developing the <span className="text-astra-red">Complete</span> Player and the
                Resilient Individual
              </h2>
              {/* The opening paragraph takes the gold slot the old subhead held,
                  so the band keeps its accent line under the headline. Sentence
                  case, not uppercase — the same call §1's hero sub-headline made.
                  mt-4 / mt-6 preserve the previous vertical rhythm exactly. */}
              <p className="type-subhead mt-4 max-w-2xl text-astra-gold">{welcome.lead}</p>
              <p className="type-body mt-6 max-w-2xl text-white/75">{welcome.body}</p>
            </div>
            {/* The card matches the text column's height instead of floating
                centred inside it (items-stretch above). The photo absorbs the
                difference — flex-1 lets it grow while the caption keeps its
                natural height — so the two columns start and finish on the same
                lines. min-h keeps the old 380px when the grid stacks to one
                column and there is no sibling height to match. */}
            <PopCard className="card-dark flex flex-col overflow-hidden" delay={0.06}>
              <SlotImage
                slot="home-welcome"
                width={1280}
                height={853}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="w-full flex-1 min-h-[380px] object-cover"
              />
              <div className="border-t border-white/10 p-5 text-white">
                {/* Kicker stays at 12px — the guide's own microcopy floor, which
                    it blesses explicitly. The caption below it was 14px, between
                    that floor and the smallest body level, so it joins P2. */}
                <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Academy training</p>
                <p className="type-body mt-2 text-white/72">
                  Academy training at Darebin International Sports Centre.
                </p>
              </div>
            </PopCard>
          </div>
        </FlowReveal>

        {/* 1 — The Astra Player Development Model (Revised homepage architecture
            §4). The four pillars used to be a strip inside the Programs band
            below; the deck makes them a section in their own right, and puts them
            BEFORE the pathway grid — "how we develop players" answered before
            "where does my child fit". Same ProgramPillarsRail component the team
            screenshotted as their reference for this section (image3), now with
            the deck's longer copy and a bold line per pillar. */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide">
            {/* Eyebrow, not a heading — it labels the section the h2 below names,
                so it stays a <p> and keeps the outline at h2 -> h3. It was 14px,
                off the guide's scale entirely; now it sits on P2 with the bold
                weight, which is the smallest level the guide defines. */}
            <p className="type-body type-strong uppercase tracking-[0.2em] text-astra-red">
              {developmentModel.eyebrow}
            </p>
            {/* The model's own name is the section's title, so it takes the h2.
                The deck labels "The Four Fundamental Pillars of Football
                Development" as the Headline, but that line describes what the
                model CONTAINS — it works as the gold deck line beneath the name,
                and this way the club's proprietary model is what the section is
                called. It also keeps the block strictly descending: eyebrow 16,
                h2 40, gold 20, body 16, cards 18 -> 16. */}
            <h2 className="crest-type type-h2 mt-3 text-white">
              The <span className="text-astra-red">Astra</span> Player Development Model
            </h2>
            <p className="type-subhead mt-4 max-w-3xl text-astra-gold">
              The Four Fundamental Pillars of Football Development
            </p>
            {/* Lead-in; its trailing colon hands straight over to the four cards. */}
            <p className="type-body mt-4 max-w-3xl text-white/75">{developmentModel.intro}</p>
            <div className="mt-10">
              <ProgramPillarsRail pillars={developmentPillars} />
            </div>
          </div>
        </FlowReveal>

        {/* 2 — Visual Pathway Grid (Revised homepage architecture §5). Replaces
            the old "Our Programs" card grid. The deck's note under this section
            reads "Change the design similar to club essentials", so the five
            blocks are now full-width rows using the Club Essentials treatment —
            navy gradient bar, gold left-edge wipe on hover, warm sheen, gold
            title, red CTA. Its OTHER note asks for "high-quality imagery behind
            each block", so each row keeps its photo as a framed tile at the left
            rather than dropping imagery altogether; text never sits over a photo,
            so legibility is unchanged. §7 Club Essentials takes the card design
            these rows are vacating. */}
        <FlowReveal className="section-band band-deep">
          <div className="container-wide">
            <div data-touchline-node>
              <p className="type-body type-strong uppercase tracking-[0.2em] text-astra-red">
                Targeted programmes
              </p>
              <h2 className="crest-type type-h2 mt-3 text-white">
                A <span className="text-astra-red">Structured</span> Journey From Grassroots to
                Representative Excellence
              </h2>
            </div>
            <div className="mt-10 flex flex-col gap-4">
              {pathwayBlocks.map((block, index) => (
                <PopCard
                  key={block.title}
                  delay={index * 0.05}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e3258] to-[#0a1f38] ring-1 ring-white/10 transition duration-300 hover:ring-astra-gold/45 hover:shadow-[0_26px_55px_-26px_rgba(0,0,0,0.9)]"
                >
                  {/* gold left-edge accent — wipes in on hover/focus */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 z-10 w-1 origin-center scale-y-0 bg-astra-gold transition-transform duration-300 group-hover:scale-y-100 group-focus-within:scale-y-100"
                  />
                  {/* warm sheen drifting from the left on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(120%_120%_at_0%_50%,rgba(242,201,76,0.10),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="relative grid items-center gap-4 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[8rem_minmax(0,1.05fr)_minmax(0,1.5fr)_15rem] lg:gap-7">
                    <div className="overflow-hidden rounded-2xl ring-1 ring-astra-gold/25">
                      <SlotImage
                        slot={block.slot}
                        width={1280}
                        height={853}
                        sizes="(min-width: 1024px) 8rem, 100vw"
                        className="h-32 w-full object-cover transition duration-500 group-hover:scale-105 lg:h-24"
                      />
                    </div>
                    <div>
                      <p className="crest-type type-h5 text-astra-gold">{block.age}</p>
                      <h3 className="crest-type type-h4 mt-1 text-white">{block.title}</h3>
                    </div>
                    <p className="type-body text-white/80">{block.copy}</p>
                    <CtaLink
                      href={block.href}
                      className="w-full justify-center whitespace-nowrap px-5 py-3 text-sm font-black uppercase tracking-wide"
                    >
                      {block.cta}
                      <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
                    </CtaLink>
                  </div>
                </PopCard>
              ))}
            </div>
            {/* Mid-page promo banner (architecture §5, after the five blocks) —
                the representative pathway that does not exist yet. Deliberately
                no CTA: it is explicitly "coming soon", and a button would promise
                somewhere to go. Sits INSIDE this section rather than as a band of
                its own, so it adds no band and cannot disturb deep/fog parity. */}
            <div
              className="relative mt-8 overflow-hidden rounded-2xl px-6 py-6 ring-1 ring-astra-gold/25 sm:px-8"
              style={{
                background:
                  "radial-gradient(120% 140% at 0% 50%, rgba(242,201,76,0.14) 0%, rgba(242,201,76,0) 52%), linear-gradient(90deg, #0a2c45 0%, #06192a 100%)"
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <span
                  aria-hidden="true"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-astra-gold/10 ring-1 ring-astra-gold/25"
                >
                  <Trophy className="h-6 w-6 text-astra-gold" />
                </span>
                <div>
                  <p className="type-body type-strong uppercase tracking-[0.2em] text-astra-gold">
                    Future pathway
                  </p>
                  <h3 className="crest-type type-h4 mt-1 text-white">
                    Representative Track (Coming Soon)
                  </h3>
                  <p className="type-body mt-2 max-w-4xl text-white/75">
                    As Astra United FC continues to grow, players progressing through our Academy
                    will have the direct opportunity to transition into future boys&apos; and girls&apos;
                    representative teams and high-performance competitive programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FlowReveal>

        {/* 3 — Trust, Safety & Professional Standards (Revised homepage
            architecture §6). Replaces the "Why families choose Astra" CONTENT —
            the deck answers the same parent question with checkable credentials
            instead of general qualities — while KEEPING the Round-6 travelling
            light board it was rendered on. See StandardsBoard for the two changes
            that adaptation needed.

            Header follows the §4 pattern: the deck's own section name takes the
            h2, and the line the deck labels "Headline:" becomes the gold deck
            line beneath it. That keeps the block descending (16 -> 40 -> 20 -> 16)
            and puts the section's actual subject in the heading. */}
        <FlowReveal className="section-band band-fog" id="trust-standards">
          <div className="container-wide">
            <div
              data-touchline-node
              className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center"
            >
              <div>
                <p className="type-body type-strong uppercase tracking-[0.2em] text-astra-red">
                  {trustStandards.eyebrow}
                </p>
                <h2 className="crest-type type-h2 mt-3 text-white">
                  Trust, <span className="text-astra-red">Safety</span> &amp; Professional Standards
                </h2>
                <p className="type-subhead mt-4 text-astra-gold">
                  Uncompromising Standards. A Protected Environment.
                </p>
                <p className="type-body mt-4 max-w-md text-white/75">{trustStandards.intro}</p>
              </div>
              <StandardsBoard items={trustStandards.items} />
            </div>
          </div>
        </FlowReveal>

        {/* 4 — Club Essentials, the Quick Navigation Matrix (Revised homepage
            architecture §7). The deck's note under this section reads "Change the
            design similar to our programs", so it now takes the photo-card design
            the pathway grid vacated: image, gold crest title, copy, red CTA. Cut
            from four items to three and all renamed. Keeps its own headline and
            gold subhead — the deck specs neither a Small Label nor a replacement
            headline here, only the matrix itself. */}
        <FlowReveal className="section-band band-deep">
          <div className="container-wide">
            <div data-touchline-node>
              <h2 className="crest-type type-h2 text-white">
                <span className="text-astra-red">Club</span> Essentials
              </h2>
              <p className="type-subhead mt-3 text-astra-gold">
                Quick links to everything you need
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubEssentials.map((item, index) => (
                <PopCard key={item.title} delay={index * 0.05} className="card-dark overflow-hidden">
                  <Link href={item.href} className="card-link group block h-full">
                    <SlotImage
                      slot={item.slot}
                      width={1280}
                      height={853}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="crest-type type-h4 text-astra-gold">{item.title}</h3>
                      <p className="type-body mt-3 text-white/72">{item.copy}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                        {item.cta}
                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 transition group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        {/* 5 — Future Preview & Coming Soon Initiatives (Revised homepage
            architecture §8), built to Mazdak's design. Each card carries its own
            generated artwork bleeding in from the right behind the copy, a
            circular gold icon badge, and a COMING SOON pill; the header pairs the
            heading with an orbiting-ball hero graphic. No CTA on the cards — none
            of these exist yet, so a button would promise somewhere to go.

            The artwork is masked, not scrimmed: each image fades out toward the
            left with a CSS mask, so the card's own gradient shows through
            underneath. An overlay would have needed a colour matching a gradient
            that changes across the card, which cannot be done with one value.

            This is also where the Astra Evolution Girls Program returns: §5 drops
            it from the live pathway grid on the deck's instruction, and until
            this band existed girls' football had no mention on the homepage. */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="type-body type-strong uppercase tracking-[0.2em] text-astra-red">
                  Future preview
                </p>
                <h2 className="crest-type type-h2 mt-3 text-white">
                  Innovation &amp; <span className="text-astra-red">Future</span> Growth Initiatives
                </h2>
                <p className="type-body mt-4 max-w-2xl text-white/72">{comingSoonIntro}</p>
              </div>
              {/* Orbiting-ball hero. The rings are drawn in CSS so they actually
                  turn, the ball is screen-blended so its image box disappears
                  against the band, and the whole assembly leans toward the
                  pointer. See FutureOrbit. */}
              <div className="hidden lg:block">
                <FutureOrbit />
              </div>
            </div>

            {/* Two across rather than four: the Learning Centre carries four times
                the copy of the Match Centre, and a wider column stops that
                imbalance stretching every card to the tallest one's height. */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {comingSoon.map((item, index) => {
                const Icon = SOON_ICONS[index];
                return (
                  <PopCard key={item.title} delay={index * 0.05} className="h-full">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c2338] to-[#061320] p-6 transition-colors duration-300 hover:border-astra-gold/45">
                      {/* generated artwork, faded out toward the left by a mask so
                          the card gradient carries through beneath it */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 w-[64%] opacity-30 sm:opacity-80"
                        style={{
                          maskImage:
                            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 38%, black 82%)",
                          WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 38%, black 82%)"
                        }}
                      >
                        <Image
                          src={item.art}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 22vw, 60vw"
                          className="object-cover"
                        />
                      </div>
                      {/* marching dashes along the top edge — under construction */}
                      <span aria-hidden="true" className="dash-rule absolute inset-x-0 top-0 h-px" />

                      <div className="relative flex items-start justify-between gap-4">
                        <span
                          aria-hidden="true"
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-astra-gold/40 bg-astra-gold/10"
                        >
                          <Icon className="h-5 w-5 text-astra-gold" />
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-astra-gold/12 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-astra-gold ring-1 ring-astra-gold/30 backdrop-blur">
                          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-astra-gold" />
                          Coming soon
                        </span>
                      </div>
                      <h3 className="crest-type type-h4 relative mt-5 max-w-[19ch] text-white">
                        {item.title}
                      </h3>
                      <p className="type-body relative mt-3 max-w-[38ch] text-white/72">{item.copy}</p>
                    </div>
                  </PopCard>
                );
              })}
            </div>
          </div>
        </FlowReveal>

        {/* 6 — Founder feature (sits between the coming-soon band and the sponsor wall) */}
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide">
            <FounderFeature />
          </div>
        </FlowReveal>

        {/* 7 — Sponsorship & Community Partners (Revised content spec §7, t8):
            moved up to sit directly after Why Families. A premium "Trusted by"
            logo wall (placeholder partners — real sponsor marks drop into the same
            slots) over the value pitch and partner tiers — tuned to attract
            sponsors and catch the eye without pulling focus from the page. */}
        <FlowReveal className="section-band band-fog text-white" id="sponsors">
          <div data-touchline-node className="container-wide">
            <h2 className="crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Sponsorship &amp; Community <span className="text-astra-red">Partners</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Astra Football Club welcomes local businesses who want to support grassroots football
              and youth pathways across Melbourne&apos;s north.
            </p>

            {/* Trusted-by logo wall (t8) — slow seamless marquee of monochrome
                partner logos on a floodlit-navy panel (brand navy + gold light
                wash from the top, echoing the stadium-lights motif). */}
            <div
              className="relative mt-8 overflow-hidden rounded-[2rem] px-6 py-7 ring-1 ring-astra-gold/20 shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9),0_0_55px_-22px_rgba(242,201,76,0.4)]"
              style={{
                background:
                  "radial-gradient(120% 140% at 50% 0%, rgba(242,201,76,0.16) 0%, rgba(242,201,76,0) 46%), linear-gradient(180deg, #0a2c45 0%, #06192a 58%, #04111d 100%)"
              }}
            >
              {/* crisp gold hairline along the top edge */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-astra-gold/70 to-transparent"
              />
              <p className="text-center text-[0.7rem] font-black uppercase tracking-[0.36em] text-astra-gold/80">
                Trusted by partners across Melbourne&apos;s north
              </p>
              <SponsorMarquee />
            </div>

            {/* The value pitch + partner tiers */}
            <div className="mt-12">
              <SectionHeader
                eyebrow="Why partner"
                title="Support grassroots football in Melbourne's north."
                copy="When you partner with Astra you invest in the health, development, and future of young people across Melbourne's north - more than a logo on a shirt."
                inverse
              />
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {sponsorTiers.map((tier, index) => (
                <PopCard key={tier.title} className="card-dark p-6" delay={index * 0.05}>
                  <ShieldCheck aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black text-white">{tier.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">{tier.copy}</p>
                </PopCard>
              ))}
            </div>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <p className="text-sm font-semibold text-white/70">
                Interested in becoming an official corporate or community sponsor?
              </p>
              <CtaLink href="/sponsors" className="px-5 py-3 text-sm font-black uppercase tracking-wide">
                View sponsorship packages
                <ExternalLink aria-hidden="true" className="btn-icon h-4 w-4" />
              </CtaLink>
            </div>
          </div>
        </FlowReveal>

        {/* 8 — Latest News & Match Reports (Revised content spec §8, t9):
            event-driven cards + View All / Subscribe, sitting directly after
            Sponsors. Renders the latest live admin posts (falls back to static
            previews when none are published). See NewsSection. */}
        <NewsSection />

        {/* Club Spotlight (before join) */}
        <SpotlightSection placement="before-join" />

        {/* 9 — "This Week at Astra": live training schedule + special events,
            admin-managed, sitting right before the Join CTA (what you'd be part
            of → join). Renders band-fog, so Join flips to band-deep below it. */}
        <ScheduleSection />

        {/* 10 — The Conversion Footer (Revised homepage architecture §10). The
            deck's closing ask: headline, the membership/trials paragraph, two
            registration CTAs, and the newsletter the deck titles "Stay Connected"
            — which moves here out of the News band.

            BAND: the team asked for this section to stand apart, so it is the one
            band on the page that leaves the deep/fog navy system entirely and
            arrives in club red. Because it is outside that alternation it also
            cannot disturb it — the ten bands above still run strictly deep/fog.

            The headline accent is GOLD, not the usual red: a red word on a red
            band would vanish. Same reason the primary CTA is gold rather than the
            site's red button. */}
        <FlowReveal className="section-band band-final">
          {/* decorative only, and deliberately siblings of the content rather than
              pseudo-elements: .band-final already spends ::before on grain, and a
              floodlight needs its own element to breathe on its own timer.
              .section-band lifts .container-wide to z-index 20, so these sit
              behind the copy without any z-index of their own. */}
          <span aria-hidden="true" className="final-beam final-beam-left" />
          <span aria-hidden="true" className="final-beam final-beam-right" />
          <span aria-hidden="true" className="final-pitch" />
          <div data-touchline-node className="container-wide">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="crest-type type-h2 text-white">
                Secure Your Place in the Astra United{" "}
                <span className="text-astra-gold">Family</span>
              </h2>
              <p className="type-lead mx-auto mt-5 max-w-2xl text-white/85">
                Don&apos;t miss out on the upcoming competitive cycle. Lock in your football club
                membership, register for our upcoming youth football trials, and experience an
                elite development journey.{" "}
                <strong className="font-bold text-astra-gold">
                  Registrations for the 2026 season are officially open.
                </strong>
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/join-us"
                  className="btn btn-sweep inline-flex w-full items-center justify-center gap-2 rounded bg-astra-gold px-6 py-3.5 text-sm font-black uppercase tracking-wide text-astra-ink sm:w-auto"
                >
                  Apply for 2026 Academy Registration
                  <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
                </Link>
                {/* no representative-trials page exists yet — §8 lists that track
                    as coming soon — so this lands on /join-us with the rest of the
                    trial information. Re-point when there is somewhere to go. */}
                <Link
                  href="/join-us"
                  className="btn inline-flex w-full items-center justify-center gap-2 rounded border border-white/45 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white/10 sm:w-auto"
                >
                  Register for Representative Trials
                  <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-3xl">
              <SubscribeBox />
            </div>
          </div>
        </FlowReveal>

      </Touchline>
    </main>
  );
}
