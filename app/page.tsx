import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { HeroIntro } from "@/src/components/HeroIntro";
import { BrandMarquee } from "@/src/components/BrandMarquee";
import { FlowReveal, PopCard } from "@/src/components/FlowReveal";
import { Touchline } from "@/src/components/Touchline";
import { SectionHeader } from "@/src/components/SectionHeader";
import { FounderFeature } from "@/src/components/FounderFeature";
import { WomensMotionCard } from "@/src/components/WomensMotionCard";
import { newsPreview, upcomingMoments } from "@/src/lib/site-data";
import { welcome, whyAstra } from "@/src/lib/content/home";
import { SpotlightSection } from "@/src/components/content/SpotlightSection";
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

// The five "Our Programs" tiers (Revised content spec §4) — a tailored pathway
// from Future Stars through the performance and girls streams. Photos resolve
// from the photo-slots registry; every card links through to the squads page.
const programCards: { age: string; title: string; copy: string; slot: SlotKey; href: string }[] = [
  {
    age: "Ages 3-5",
    title: "Astra Future Stars",
    copy: "An energetic, fun introduction to local football — building fundamental motor skills, confidence, and early coordination through play-based activities.",
    slot: "home-academy-mini",
    href: "/teams"
  },
  {
    age: "U5-U7",
    title: "Astra Foundation Hub",
    copy: "Fostering a genuine passion for the game: initial technical development, basic ball mastery, and understanding teamwork in a supportive environment.",
    slot: "home-academy-junior",
    href: "/teams"
  },
  {
    age: "U8-U13",
    title: "Astra Youth Academy",
    copy: "Our core elite youth tier. Under professional coaching, players refine tactical awareness, positional play, and advanced technical skills for competitive fixtures.",
    slot: "home-academy-youth",
    href: "/teams"
  },
  {
    age: "U8-U16",
    title: "Next-Gen Performance Groups",
    copy: "For advanced, high-performance players: high-intensity tactical training and accelerated development streams to prepare for senior trials and representative honours.",
    slot: "home-program-performance",
    href: "/teams"
  },
  {
    age: "Ages 9-13",
    title: "Astra Evolution Girls Program",
    copy: "A premier, dedicated stream driving girls' football development — specialised coaching to empower female athletes and cultivate the next generation of leaders.",
    slot: "home-program-girls",
    href: "/teams"
  }
];

// The four development pillars shown as a strip beneath the program cards.
const trialPillars = [
  { label: "Technical", copy: "Ball control and passing range." },
  { label: "Tactical", copy: "Game understanding and positioning." },
  { label: "Physical", copy: "Speed, agility, and balance." },
  { label: "Character", copy: "Work rate, respect, team-first attitude." }
];

// Club Essentials quick-links matrix (Revised content spec §5): routes parents,
// senior players, and fans straight to their destination. Rendered as full-width
// navy bars (t6) — gold title · description · red CTA.
const clubEssentials: { title: string; copy: string; cta: string; href: string }[] = [
  {
    title: "Our Teams",
    copy: "From Under 6s to First Team squads, explore our comprehensive Astra FC team rosters.",
    cta: "Explore Squads",
    href: "/teams"
  },
  {
    title: "Astra Academy",
    copy: "Specialist football coaching programmes engineered for elite youth player development.",
    cta: "Academy Programs",
    href: "/teams"
  },
  {
    title: "Fixtures & Results",
    copy: "Stay up to date with the latest league fixtures, results, and upcoming kick-off times.",
    cta: "Match Centre",
    href: "/news-media"
  },
  {
    title: "Join the Club",
    copy: "Comprehensive information on youth football trials, club membership fees, and registration.",
    cta: "Trial Information",
    href: "/join-us"
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

        {/* 0 — Welcome to Astra United (Revised content spec §3): the first
            standalone section after the hero motion. Big crest headline with the
            red "United" accent, gold subheadline, the two intro paragraphs, and
            the academy training photo — matching the team's t3 example. */}
        <FlowReveal className="section-band band-deep">
          <div
            data-touchline-node
            className="container-wide grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          >
            <div>
              <h2 className="crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                Welcome to Astra <span className="text-astra-red">United</span> Football Club
              </h2>
              <p className="mt-4 text-lg font-black uppercase tracking-[0.04em] text-astra-gold sm:text-xl">
                {welcome.subhead}
              </p>
              <div className="mt-6 space-y-4">
                {welcome.intro.map((para) => (
                  <p key={para} className="max-w-2xl text-base leading-7 text-white/75">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <PopCard className="card-dark overflow-hidden" delay={0.06}>
              <SlotImage
                slot="home-welcome"
                width={1280}
                height={853}
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="h-[380px] w-full object-cover"
              />
              <div className="border-t border-white/10 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Academy training</p>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Academy training at Darebin International Sports Centre.
                </p>
              </div>
            </PopCard>
          </div>
        </FlowReveal>

        {/* 1 — Our Programs (Revised content spec §4): sits directly after the
            Welcome band. Headline with the red "Our" accent + subhead, then the
            five program cards in a 3-on-top / 2-centred-below grid (t4). */}
        <FlowReveal className="section-band band-fog">
          <div className="container-wide">
            <div data-touchline-node>
              <h2 className="crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                <span className="text-astra-red">Our</span> Programs
              </h2>
              <p className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-astra-gold sm:text-xl">
                A tailored pathway for every player
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {programCards.map((program, index) => (
                <PopCard
                  key={program.title}
                  delay={index * 0.05}
                  className={`card-dark overflow-hidden lg:col-span-2${index === 3 ? " lg:col-start-2" : ""}`}
                >
                  <Link href={program.href} className="card-link group block h-full">
                    <SlotImage
                      slot={program.slot}
                      width={1280}
                      height={853}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-6">
                      <p className="crest-type text-2xl text-astra-gold">{program.age}</p>
                      <h3 className="mt-2 text-xl font-black text-white">{program.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/72">{program.copy}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                        Learn more <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </PopCard>
              ))}
            </div>
            {/* Development pillars strip beneath the program cards (t5) */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trialPillars.map((pillar, index) => (
                <PopCard key={pillar.label} className="card-dark p-5" delay={index * 0.04}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{pillar.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">{pillar.copy}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        {/* 2 — Club Essentials (Revised content spec §5): a quick-links matrix
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
              {clubEssentials.map((item, index) => (
                <PopCard
                  key={item.title}
                  delay={index * 0.05}
                  className="overflow-hidden rounded-2xl bg-[#0c2a4a] ring-1 ring-white/10"
                >
                  <div className="grid items-center gap-4 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[0.85fr_1.6fr_auto] lg:gap-8">
                    <p className="crest-type text-2xl text-astra-gold">{item.title}</p>
                    <p className="text-sm leading-6 text-white/80 sm:text-base">{item.copy}</p>
                    <CtaLink
                      href={item.href}
                      className="w-full justify-center px-5 py-3 text-sm font-black uppercase tracking-wide lg:w-auto"
                    >
                      {item.cta}
                    </CtaLink>
                  </div>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        {/* 3 — Live pitch status + next moment */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
            <PopCard className="red-rule card-dark p-6 pl-8 sm:p-8 sm:pl-10">
              <p className="mb-2 text-sm font-black uppercase tracking-normal text-astra-red">Live pitch status</p>
              <h2 className="crest-type text-3xl leading-none text-white">All Astra FC pitches are open.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                Training and match-day activity is currently available at Darebin International Sports Centre. Check back on match mornings for any pitch-status changes.
              </p>
            </PopCard>
            <PopCard className="card-dark p-6 sm:p-8" delay={0.06}>
              <div className="flex items-start gap-4">
                <CalendarDays aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-astra-gold" />
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-astra-red">Next campaign moment</p>
                  <h3 className="mt-2 text-2xl font-black text-white">2026 registrations and trials</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    Registrations are open now for the 2026 season. Trial windows, camps, and awards night details are confirmed below.
                  </p>
                </div>
              </div>
            </PopCard>
          </div>
        </FlowReveal>

        {/* 4 — Why families choose Astra (Revised content spec §6). Welcome now
            lives in its own band above; this section keeps the reasons grid. */}
        <FlowReveal className="section-band band-deep">
          <div className="container-wide">
            <div data-touchline-node>
              <SectionHeader
                eyebrow="Why Astra"
                title="Why families choose Astra."
                copy="Clear, easy-to-scan reasons to back the decision to join — qualified coaching, a safe and inclusive environment, and a structured pathway from the Youth Academy to senior football."
                inverse
              />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {whyAstra.map((reason, index) => (
                <PopCard key={reason} className="card-dark flex items-start gap-3 p-5" delay={index * 0.04}>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-astra-red/15">
                    <Check aria-hidden="true" className="h-4 w-4 text-astra-red" />
                  </span>
                  <p className="text-sm font-semibold leading-6 text-white/90">{reason}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        {/* Club Spotlight (mid) */}
        <SpotlightSection placement="mid" />

        {/* 5 — Founder feature */}
        <FlowReveal className="section-band band-fog">
          <div data-touchline-node className="container-wide">
            <FounderFeature />
          </div>
        </FlowReveal>

        {/* 6 — Senior & Women's teams */}
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Senior pathway"
                title="Men's, women's, and U23 football."
                copy="The senior program gives emerging players a competitive destination and shows families that the academy has a real long-term pathway."
                inverse
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {["Men's First Team", "Women's First Team", "Under-23s"].map((team, index) => (
                  <PopCard key={team} className="card-dark p-5" delay={index * 0.05}>
                    <Trophy aria-hidden="true" className="mb-4 h-6 w-6 text-astra-gold" />
                    <p className="font-black text-white">{team}</p>
                  </PopCard>
                ))}
              </div>
            </div>
            <PopCard className="card-dark overflow-hidden">
              <WomensMotionCard />
              <div className="border-t border-white/10 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Women's First Team</p>
                <p className="mt-2 text-sm leading-6 text-white/72">A growing women's program at Darebin International Sports Centre.</p>
              </div>
            </PopCard>
          </div>
        </FlowReveal>

        {/* 7 — News & media */}
        <FlowReveal className="section-band band-fog">
          <div className="container-wide">
            <div data-touchline-node className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <SectionHeader
                  eyebrow="News & media"
                  title="From the training ground to the touchline."
                  copy="Match reports, club announcements, events, and highlights from across the Astra community - a content hub for the whole season."
                  inverse
                />
                <div className="mt-8 grid gap-4">
                  {newsPreview.map((item, index) => (
                    <PopCard key={item.title} className="card-dark p-6" delay={index * 0.05}>
                      <p className="text-xs font-black uppercase tracking-normal text-astra-red">{item.kicker}</p>
                      <h3 className="mt-3 text-2xl font-black leading-tight text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/72">{item.copy}</p>
                    </PopCard>
                  ))}
                </div>
              </div>
              <PopCard className="card-dark overflow-hidden">
                <SlotImage slot="home-news" width={1280} height={853} sizes="(min-width: 1024px) 40vw, 100vw" className="h-[300px] w-full object-cover" />
                <div className="grid gap-px bg-white/10 sm:grid-cols-3">
                  {upcomingMoments.map((moment) => (
                    <div key={moment.title} className="bg-astra-ink p-4 text-white">
                      <Clock aria-hidden="true" className="mb-3 h-4 w-4 text-astra-gold" />
                      <p className="text-[0.65rem] font-black uppercase tracking-normal text-astra-gold">{moment.meta}</p>
                      <p className="mt-1 text-sm font-black leading-5">{moment.title}</p>
                    </div>
                  ))}
                </div>
              </PopCard>
            </div>
          </div>
        </FlowReveal>

        {/* Club Spotlight (after news) */}
        <SpotlightSection placement="after-news" />

        {/* 8 — Sponsors */}
        <FlowReveal className="section-band band-deep text-white">
          <div data-touchline-node className="container-wide">
            <SectionHeader
              eyebrow="Sponsors"
              title="Support grassroots football in Melbourne's north."
              copy="When you partner with Astra you invest in the health, development, and future of young people across Melbourne's north - more than a logo on a shirt."
              inverse
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {sponsorTiers.map((tier, index) => (
                <PopCard key={tier.title} className="card-dark p-6" delay={index * 0.05}>
                  <ShieldCheck aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black text-white">{tier.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">{tier.copy}</p>
                </PopCard>
              ))}
            </div>
            <CtaLink href="/sponsors" className="mt-9 px-5 py-3 text-sm font-black uppercase tracking-wide">
              View sponsorship packages
              <ExternalLink aria-hidden="true" className="btn-icon h-4 w-4" />
            </CtaLink>
          </div>
        </FlowReveal>

        {/* Club Spotlight (before join) */}
        <SpotlightSection placement="before-join" />

        {/* 9 — Join / contact CTA */}
        <FlowReveal className="section-band band-fog">
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
      </Touchline>
    </main>
  );
}
