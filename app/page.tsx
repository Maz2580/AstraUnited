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

// Image-forward academy cards (photos from public/images/manifest.json).
const academyCards: { age: string; title: string; copy: string; slot: SlotKey }[] = [
  {
    age: "U6-U8",
    title: "Mini-Kickers",
    copy: "Fun-based football foundations, confidence on the ball, and first friendships in the game.",
    slot: "home-academy-mini"
  },
  {
    age: "U9-U12",
    title: "Junior Academy",
    copy: "Small-sided training, technical repetition, and age-appropriate tactical awareness.",
    slot: "home-academy-junior"
  },
  {
    age: "U13-U18",
    title: "Youth Development",
    copy: "A stronger bridge to 11-a-side football, game intelligence, and senior progression.",
    slot: "home-academy-youth"
  }
];

// The four assessment pillars (from Join Us / Trials content).
const trialPillars = [
  { label: "Technical", copy: "Ball control and passing range." },
  { label: "Tactical", copy: "Game understanding and positioning." },
  { label: "Physical", copy: "Speed, agility, and balance." },
  { label: "Character", copy: "Work rate, respect, team-first attitude." }
];

export default function Home() {
  return (
    <main id="main-content">
      <HeroIntro />
      <BrandMarquee />
      <Touchline>
        {/* Club Spotlight (top) — admin event posts under the hero; absent when none live */}
        <SpotlightSection placement="top" />

        {/* 1 — Live pitch status + next moment */}
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

        {/* 2 — Welcome / why Astra */}
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionHeader eyebrow={welcome.eyebrow} title={welcome.title} copy={welcome.copy} inverse />
              <PopCard className="card-dark mt-8 overflow-hidden">
                <SlotImage slot="home-welcome" width={1280} height={853} sizes="(min-width: 1024px) 45vw, 100vw" className="h-[360px] w-full object-cover" />
                <div className="border-t border-white/10 p-5 text-white">
                  <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Academy training</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">Academy training at Darebin International Sports Centre.</p>
                </div>
              </PopCard>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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

        {/* 3 — Academy pathway */}
        <FlowReveal className="section-band band-fog">
          <div className="container-wide">
            <div data-touchline-node>
              <SectionHeader
                eyebrow="Youth Academy"
                title="Development over results."
                copy="The academy is the heartbeat of Astra United FC: confident players, technical excellence, tactical awareness, and social growth from U6 to U18."
                inverse
              />
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {academyCards.map((stage, index) => (
                <PopCard key={stage.age} className="card-dark overflow-hidden" delay={index * 0.06}>
                  <SlotImage slot={stage.slot} width={1280} height={853} sizes="(min-width: 768px) 33vw, 100vw" className="h-44 w-full object-cover" />
                  <div className="p-6">
                    <p className="crest-type text-2xl text-astra-gold">{stage.age}</p>
                    <h3 className="mt-2 text-xl font-black text-white">{stage.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/72">{stage.copy}</p>
                  </div>
                </PopCard>
              ))}
            </div>
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

        {/* Club Spotlight (mid) */}
        <SpotlightSection placement="mid" />

        {/* 4 — Founder feature */}
        <FlowReveal className="section-band band-deep">
          <div data-touchline-node className="container-wide">
            <FounderFeature />
          </div>
        </FlowReveal>

        {/* 5 — Senior & Women's teams */}
        <FlowReveal className="section-band band-fog">
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

        {/* 6 — News & media */}
        <FlowReveal className="section-band band-deep">
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

        {/* 7 — Sponsors */}
        <FlowReveal className="section-band band-fog text-white">
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

        {/* 8 — Join / contact CTA */}
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
      </Touchline>
    </main>
  );
}
