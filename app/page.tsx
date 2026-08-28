import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
  type LucideIcon
} from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { HeroIntro } from "@/src/components/HeroIntro";
import { BrandMarquee } from "@/src/components/BrandMarquee";
import { FlowReveal, PopCard } from "@/src/components/FlowReveal";
import { Touchline } from "@/src/components/Touchline";
import { SectionHeader } from "@/src/components/SectionHeader";
import { FounderFeature } from "@/src/components/FounderFeature";
import { WhyFamiliesBoard } from "@/src/components/WhyFamiliesBoard";
import { ProgramPillarsRail } from "@/src/components/ProgramPillarsRail";
import { SponsorMarquee } from "@/src/components/SponsorMarquee";
import { developmentModel, developmentPillars, welcome, whyFamilies } from "@/src/lib/content/home";
import { SpotlightSection } from "@/src/components/content/SpotlightSection";
import { NewsSection } from "@/src/components/content/NewsSection";
import { ScheduleSection } from "@/src/components/content/ScheduleSection";
import { SlotImage } from "@/src/components/content/SlotImage";
import type { SlotKey } from "@/src/lib/content/photo-slots";


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

// Club Essentials quick-links matrix (Revised content spec §5): routes parents,
// senior players, and fans straight to their destination. Rendered as full-width
// navy bars (t6) — gold title · description · red CTA.
const clubEssentials: { title: string; copy: string; cta: string; href: string; icon: LucideIcon }[] = [
  {
    title: "Our Teams",
    copy: "From Under 6s to First Team squads, explore our comprehensive Astra FC team rosters.",
    cta: "Explore Squads",
    href: "/teams",
    icon: Users
  },
  {
    title: "Astra Academy",
    copy: "Specialist football coaching programmes engineered for elite youth player development.",
    cta: "Academy Programs",
    href: "/teams",
    icon: GraduationCap
  },
  {
    title: "Fixtures & Results",
    copy: "Stay up to date with the latest league fixtures, results, and upcoming kick-off times.",
    cta: "Match Centre",
    href: "/news-media",
    icon: CalendarDays
  },
  {
    title: "Join the Club",
    copy: "Comprehensive information on youth football trials, club membership fees, and registration.",
    cta: "Trial Information",
    href: "/join-us",
    icon: ClipboardList
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
        <FlowReveal className="section-band band-fog">
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
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide">
            {/* Eyebrow, not a heading — it labels the section the h2 below names,
                so it stays a <p> and keeps the outline at h2 -> h3. It was 14px,
                off the guide's scale entirely; now it sits on P2 with the bold
                weight, which is the smallest level the guide defines. */}
            <p className="type-body type-strong uppercase tracking-[0.2em] text-astra-red">
              {developmentModel.eyebrow}
            </p>
            <h2 className="crest-type type-h2 mt-3 text-white">
              The <span className="text-astra-red">Four</span> Fundamental Pillars of Football
              Development
            </h2>
            {/* The deck gives §4 a label, a headline and this lead-in, with no
                separate subhead. The lead-in takes the gold accent line every
                other band has, and its trailing colon hands straight over to the
                four cards. */}
            <p className="type-subhead mt-4 max-w-3xl text-astra-gold">{developmentModel.intro}</p>
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
        <FlowReveal className="section-band band-fog">
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

        {/* 3 — Club Essentials (Revised content spec §5): a quick-links matrix
            that routes each persona to their destination. Full-width navy bars
            on a near-black band — gold title, description, red CTA (t6). */}
        <FlowReveal className="section-band band-deep">
          <div className="container-wide">
            <div data-touchline-node>
              <h2 className="crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                <span className="text-astra-red">Club</span> Essentials
              </h2>
              <p className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-astra-gold sm:text-xl">
                Quick links to everything you need
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-4">
              {clubEssentials.map((item, index) => {
                const Icon = item.icon;
                return (
                  <PopCard
                    key={item.title}
                    delay={index * 0.05}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0e3258] to-[#0a1f38] ring-1 ring-white/10 transition duration-300 hover:ring-astra-gold/45 hover:shadow-[0_26px_55px_-26px_rgba(0,0,0,0.9)]"
                  >
                    {/* gold left-edge accent — wipes in on hover/focus */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1 origin-center scale-y-0 bg-astra-gold transition-transform duration-300 group-hover:scale-y-100 group-focus-within:scale-y-100"
                    />
                    {/* warm sheen drifting from the left on hover */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(120%_120%_at_0%_50%,rgba(242,201,76,0.10),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <div className="relative grid items-center gap-4 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[3.5rem_minmax(0,0.9fr)_minmax(0,1.7fr)_15rem] lg:gap-7">
                      {/* icon tile */}
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-astra-gold/10 ring-1 ring-astra-gold/25 transition-colors duration-300 group-hover:bg-astra-gold/20">
                        <Icon aria-hidden="true" className="h-6 w-6 text-astra-gold" />
                      </span>
                      <p className="crest-type text-2xl text-astra-gold">{item.title}</p>
                      <p className="text-sm leading-6 text-white/80 sm:text-base">{item.copy}</p>
                      <CtaLink
                        href={item.href}
                        className="w-full justify-center whitespace-nowrap px-5 py-3 text-sm font-black uppercase tracking-wide"
                      >
                        {item.cta}
                        <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
                      </CtaLink>
                    </div>
                  </PopCard>
                );
              })}
            </div>
          </div>
        </FlowReveal>

        {/* 4 — Founder feature (moved to sit directly after Club Essentials) */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide">
            <FounderFeature />
          </div>
        </FlowReveal>

        {/* 5 — Why families choose Astra (Revised content spec §6): moved to sit
            directly after the founder bio. Interactive "hanging tags" board (t7) —
            the five reasons swing from a rail on scroll, drag, and pointer for a
            3D, locker-room feel that rewards continued scrolling. */}
        <FlowReveal className="section-band band-deep" id="why-families">
          <div className="container-wide">
            <div
              data-touchline-node
              className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center"
            >
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-astra-red">Why Astra</p>
                <h2 className="mt-3 crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  Why families choose <span className="text-astra-red">Astra</span>
                </h2>
                <p className="mt-4 text-lg font-black uppercase tracking-[0.04em] text-astra-gold sm:text-xl">
                  Every reason is a step on the pathway
                </p>
                <p className="mt-4 max-w-md text-base leading-7 text-white/70">
                  Easy-to-scan reasons that reinforce the decision to join — from accredited
                  coaching to a safe, inclusive pathway from the Youth Academy to senior football.
                </p>
              </div>
              <WhyFamiliesBoard reasons={whyFamilies} />
            </div>
          </div>
        </FlowReveal>

        {/* 6 — Sponsorship & Community Partners (Revised content spec §7, t8):
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

        {/* 7 — Latest News & Match Reports (Revised content spec §8, t9):
            event-driven cards + View All / Subscribe, sitting directly after
            Sponsors. Renders the latest live admin posts (falls back to static
            previews when none are published). See NewsSection. */}
        <NewsSection />

        {/* Club Spotlight (before join) */}
        <SpotlightSection placement="before-join" />

        {/* 8 — "This Week at Astra": live training schedule + special events,
            admin-managed, sitting right before the Join CTA (what you'd be part
            of → join). Renders band-fog, so Join flips to band-deep below it. */}
        <ScheduleSection />

        {/* 9 — Join / contact CTA (Revised content spec §9): moved to sit directly
            after the News section as the closing call to action. */}
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="Join Astra"
              title="Ready to lace up your boots?"
              copy="Registration is open for the 2026 season. Join as a player, coach, volunteer, or community partner - we train and play at Darebin International Sports Centre."
              inverse
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PopCard>
                <Link href="/join-us" className="card-dark card-link group block h-full p-6 text-white">
                  <Users aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black">Register or trial</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">Player registration, open trials, and development pathway information for the 2026 season.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    Start here <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
              <PopCard delay={0.08}>
                <Link href="/contact" className="card-dark card-link group block h-full p-6 text-white">
                  <MapPin aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black">Darebin International Sports Centre</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">281 Darebin Road, Thornbury VIC 3071. Reach us for registration, sponsorship, volunteering, or media.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    Contact the club <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
            </div>
          </div>
        </FlowReveal>

        {/* Club Spotlight (mid) */}
        <SpotlightSection placement="mid" />

        {/* Club Spotlight (after news) */}
        <SpotlightSection placement="after-news" />
      </Touchline>
    </main>
  );
}
