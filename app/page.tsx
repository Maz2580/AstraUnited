import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import { HeroIntro } from "@/src/components/HeroIntro";
import { FlowReveal, PopCard } from "@/src/components/FlowReveal";
import { ScrollBallFlow } from "@/src/components/ScrollBallFlow";
import { SectionHeader } from "@/src/components/SectionHeader";
import {
  academyPathway,
  homeHighlights,
  newsPreview,
  quickFacts,
  upcomingMoments
} from "@/src/lib/site-data";
import { GroundPanel } from "@/src/components/GroundPanel";

export default function Home() {
  return (
    <main id="main-content">
      <HeroIntro />
      <ScrollBallFlow>
        <FlowReveal className="section-band bg-astra-white">
          <div data-flow-group className="flow-group container-wide grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
            <PopCard className="red-rule card-plain p-6 pl-8 sm:p-8 sm:pl-10">
              <p className="mb-2 text-sm font-black uppercase tracking-normal text-astra-red">Live pitch status</p>
              <h2 className="crest-type text-3xl leading-none text-astra-ink">All Astra FC pitches are open.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                Training and match-day activity is currently available at Darebin International Sports Centre. Check back on match mornings for any pitch-status changes.
              </p>
            </PopCard>
            <PopCard className="card-plain p-6 sm:p-8" delay={0.06}>
              <div className="flex items-start gap-4">
                <CalendarDays aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-astra-red" />
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-astra-red">Next campaign moment</p>
                  <h3 className="mt-2 text-2xl font-black text-astra-ink">2026 registrations and trials</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Registrations are open now for the 2026 season. Trial windows, camps, and awards night details are confirmed below.
                  </p>
                </div>
              </div>
            </PopCard>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-white">
          <div data-flow-group className="flow-group container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Welcome"
                title="Excellence in local football and player development."
                copy="Astra United FC gives families a professional football environment where talent is nurtured from the grassroots up, supported by qualified coaching and strong community values."
              />
              <PopCard className="mt-8 overflow-hidden rounded border border-astra-ink/12 bg-astra-ink shadow-crest">
                <Image
                  src="/images/academy-1.jpg"
                  alt="Astra United academy players training with a coach at Darebin International Sports Centre"
                  width={900}
                  height={1200}
                  className="h-[420px] w-full object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
                <div className="border-t border-white/10 p-5 text-white">
                  <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Academy training</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">Academy training at Darebin International Sports Centre.</p>
                </div>
              </PopCard>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {homeHighlights.map((item, index) => (
                <PopCard key={item.title} className="card-plain p-6" delay={index * 0.05}>
                  <item.icon aria-hidden="true" className="mb-5 h-7 w-7 text-astra-red" />
                  <h3 className="text-xl font-black text-astra-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{item.copy}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-astra-ink text-white">
          <div className="container-wide">
            <SectionHeader
              eyebrow="Club essentials"
              title="Everything families ask first."
              copy="Everything parents, players, sponsors, and volunteers need to know about Astra United FC."
              inverse
            />
            <div data-flow-group className="flow-group mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickFacts.map((fact, index) => (
                <PopCard key={fact.label} className="rounded border border-white/12 bg-white/6 p-5 backdrop-blur" delay={index * 0.05}>
                  <p className="text-xs font-black uppercase tracking-normal text-astra-gold">{fact.label}</p>
                  <p className="mt-3 text-base font-semibold leading-6 text-white">{fact.value}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-[#f3f6f8]">
          <div className="container-wide">
            <div data-flow-group className="flow-group grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <SectionHeader
                eyebrow="Youth Academy"
                title="Development over results."
                copy="The academy is the heartbeat of Astra United FC: confident players, technical excellence, tactical awareness, and social growth from U6 to U18."
              />
              <div className="grid gap-4 md:grid-cols-3">
                {academyPathway.map((stage, index) => (
                  <PopCard key={stage.age} className="card-plain p-6" delay={index * 0.06}>
                    <p className="crest-type text-3xl text-astra-red">{stage.age}</p>
                    <h3 className="mt-4 text-xl font-black text-astra-ink">{stage.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{stage.copy}</p>
                  </PopCard>
                ))}
              </div>
            </div>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-white">
          <div data-flow-group className="flow-group container-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Senior pathway"
                title="Men's, women's, and U23 football."
                copy="The senior program gives emerging players a competitive destination and shows families that the academy has a real long-term pathway."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {["Men's First Team", "Women's First Team", "Under-23s"].map((team, index) => (
                  <PopCard key={team} className="rounded border border-astra-ink/12 bg-astra-white p-5" delay={index * 0.05}>
                    <Trophy aria-hidden="true" className="mb-4 h-6 w-6 text-astra-red" />
                    <p className="font-black text-astra-ink">{team}</p>
                  </PopCard>
                ))}
              </div>
            </div>
            <PopCard className="overflow-hidden rounded">
              <GroundPanel />
            </PopCard>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-[#eef3f1]">
          <div className="container-wide">
            <SectionHeader
              eyebrow="News and media"
              title="A content hub ready for the annual campaign."
              copy="The spreadsheet's monthly calendar becomes a practical content system: registrations, camps, women in football, education, community partners, finals, and awards all have a place to live."
            />
            <div data-flow-group className="flow-group mt-10 grid gap-4 lg:grid-cols-3">
              {newsPreview.map((item, index) => (
                <PopCard key={item.title} className="card-plain p-6" delay={index * 0.05}>
                  <p className="text-xs font-black uppercase tracking-normal text-astra-red">{item.kicker}</p>
                  <h3 className="mt-4 text-2xl font-black leading-tight text-astra-ink">{item.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{item.copy}</p>
                </PopCard>
              ))}
            </div>
            <div data-flow-group className="flow-group mt-8 grid gap-4 md:grid-cols-3">
              {upcomingMoments.map((moment, index) => (
                <PopCard key={moment.title} className="rounded border border-astra-turf/20 bg-white p-5" delay={index * 0.05}>
                  <Clock aria-hidden="true" className="mb-4 h-5 w-5 text-astra-turf" />
                  <p className="text-xs font-black uppercase tracking-normal text-astra-red">{moment.meta}</p>
                  <h3 className="mt-2 font-black text-astra-ink">{moment.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{moment.copy}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-astra-ink text-white">
          <div data-flow-group className="flow-group container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="Join Astra"
              title="Ready to lace up your boots?"
              copy="Registration is open for the 2026 season. Join as a player, coach, volunteer, or community partner."
              inverse
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PopCard>
                <Link href="/join-us" className="group block rounded border border-white/12 bg-white p-6 text-astra-ink transition hover:-translate-y-1 hover:shadow-crest">
                  <Users aria-hidden="true" className="mb-5 h-7 w-7 text-astra-red" />
                  <h3 className="text-xl font-black">Register or trial</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">Player registration, open trials, and development pathway information.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    Start here <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
              <PopCard delay={0.08}>
                <Link href="/sponsors" className="group block rounded border border-white/12 bg-white p-6 text-astra-ink transition hover:-translate-y-1 hover:shadow-crest">
                  <ShieldCheck aria-hidden="true" className="mb-5 h-7 w-7 text-astra-red" />
                  <h3 className="text-xl font-black">Partner with the club</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">Sponsorship packages for businesses supporting grassroots football.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    View packages <ExternalLink aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
            </div>
          </div>
        </FlowReveal>

        <FlowReveal className="section-band bg-white">
          <div data-flow-group className="flow-group container-wide grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <SectionHeader
              eyebrow="Contact"
              title="Based at Darebin, built for Melbourne's north."
              copy="Reach us for registration, sponsorship, volunteering, media, or safeguarding enquiries. We aim to respond within 48 business hours."
            />
            <PopCard className="card-plain p-6 sm:p-8">
              <MapPin aria-hidden="true" className="mb-5 h-7 w-7 text-astra-red" />
              <h3 className="text-2xl font-black text-astra-ink">Darebin International Sports Centre</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">281 Darebin Road, Thornbury VIC 3071, Australia</p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded bg-astra-ink px-4 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-astra-red"
              >
                Contact the club
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </PopCard>
          </div>
        </FlowReveal>
      </ScrollBallFlow>
    </main>
  );
}
