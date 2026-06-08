import Link from "next/link";
import Image from "next/image";
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
import { HeroIntro } from "@/src/components/HeroIntro";
import { BrandMarquee } from "@/src/components/BrandMarquee";
import { FlowReveal, PopCard } from "@/src/components/FlowReveal";
import { Touchline } from "@/src/components/Touchline";
import { SectionHeader } from "@/src/components/SectionHeader";
import { FounderFeature } from "@/src/components/FounderFeature";
import {
  academyPathway,
  newsPreview,
  upcomingMoments
} from "@/src/lib/site-data";
import { welcome, whyAstra } from "@/src/lib/content/home";

// In-page photos pulled from public/images/manifest.json (-1280.webp variants).
const photos = {
  welcome: {
    src: "/images/academy/astra-academy-training-wide-1280.webp",
    alt: "Astra United youth academy players in training bibs during a drill session on the DISC Darebin pitch",
    blurDataURL:
      "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAsAA4BaJbAAAxZbZ/GZAAD+1z/ZYKqmtnVc6okA+qCnDfoYAtrg2zI4XIaE2KYUl2ZAO/KqM+alyLiJIxqwefcpOOsovAA="
  },
  academy: {
    src: "/images/academy/astra-academy-dribble-duel-1280.webp",
    alt: "Astra United youth player in navy kit dribbling past a defender during an academy training session at Darebin",
    blurDataURL:
      "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAsAA4BaJYgAAv+5vRNYAAD+voAKXwDNy2IhEEynnmVSeUn0lKdwz3awb6C8nEReoy/qU7ZZOAAA"
  },
  womens: {
    src: "/images/womens/astra-womens-portrait-ball-1280.webp",
    alt: "Astra United female player holding the match ball confidently on the DISC Darebin pitch",
    blurDataURL:
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAADQAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JQAALlZyxfS0o3E0CIHAA/u7XAaCOaox+MDB08XmRHNQmAPXsiyGg2WPsQ57hK/NCKRAjt9q3wdhD8+4QshiRXb/IWg+3+BVULRVdiDxyRqMSH/AZuTwKLlvt2ZzYQAA="
  },
  news: {
    src: "/images/community/astra-community-team-photo-1280.webp",
    alt: "Astra United FC youth squad and coaching staff posing for a team photo at the Darebin ground",
    blurDataURL:
      "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADwAQCdASoQAAsAA4BaJaAC7AEO51NfsyAA/uhR8gOKYM+H/sHOAha6twOxn++SjZ011xmUaPcrFeIDsIUFYFIA3e9Pz9z6rxA4narSxexzNwWSAAA="
  }
};

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

export default function Home() {
  return (
    <main id="main-content">
      <HeroIntro />
      <BrandMarquee />
      <Touchline>
        {/* 1 — Live pitch status + next moment */}
        <FlowReveal className="section-band bg-astra-white">
          <div data-touchline-node className="container-wide grid gap-5 md:grid-cols-[1.1fr_0.9fr] md:items-stretch">
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

        {/* 2 — Welcome / why Astra */}
        <FlowReveal className="section-band bg-white">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionHeader eyebrow={welcome.eyebrow} title={welcome.title} copy={welcome.copy} />
              <PopCard className="mt-8 overflow-hidden rounded border border-astra-ink/12 bg-astra-ink shadow-crest">
                <Image
                  src={photos.welcome.src}
                  alt={photos.welcome.alt}
                  width={1280}
                  height={853}
                  placeholder="blur"
                  blurDataURL={photos.welcome.blurDataURL}
                  className="h-[360px] w-full object-cover"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                />
                <div className="border-t border-white/10 p-5 text-white">
                  <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Academy training</p>
                  <p className="mt-2 text-sm leading-6 text-white/72">Academy training at Darebin International Sports Centre.</p>
                </div>
              </PopCard>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {whyAstra.map((reason, index) => (
                <PopCard key={reason} className="card-plain flex items-start gap-3 p-5" delay={index * 0.04}>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-astra-red/10">
                    <Check aria-hidden="true" className="h-4 w-4 text-astra-red" />
                  </span>
                  <p className="text-sm font-semibold leading-6 text-astra-ink">{reason}</p>
                </PopCard>
              ))}
            </div>
          </div>
        </FlowReveal>

        {/* 3 — Academy pathway */}
        <FlowReveal className="section-band bg-[#f3f6f8]">
          <div className="container-wide">
            <div data-touchline-node className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <SectionHeader
                  eyebrow="Youth Academy"
                  title="Development over results."
                  copy="The academy is the heartbeat of Astra United FC: confident players, technical excellence, tactical awareness, and social growth from U6 to U18."
                />
                <PopCard className="mt-8 overflow-hidden rounded border border-astra-ink/12 shadow-crest">
                  <Image
                    src={photos.academy.src}
                    alt={photos.academy.alt}
                    width={1280}
                    height={853}
                    placeholder="blur"
                    blurDataURL={photos.academy.blurDataURL}
                    className="h-[260px] w-full object-cover"
                    sizes="(min-width: 1024px) 30vw, 100vw"
                  />
                </PopCard>
              </div>
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

        {/* 4 — Founder feature */}
        <FlowReveal className="section-band bg-astra-ink">
          <div data-touchline-node className="container-wide">
            <FounderFeature />
          </div>
        </FlowReveal>

        {/* 5 — Senior & Women's teams */}
        <FlowReveal className="section-band bg-white">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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
            <PopCard className="overflow-hidden rounded border border-astra-ink/12 bg-astra-ink shadow-crest">
              <Image
                src={photos.womens.src}
                alt={photos.womens.alt}
                width={1280}
                height={1920}
                placeholder="blur"
                blurDataURL={photos.womens.blurDataURL}
                className="h-[460px] w-full object-cover object-[center_22%]"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="border-t border-white/10 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Women's First Team</p>
                <p className="mt-2 text-sm leading-6 text-white/72">A growing women's program at Darebin International Sports Centre.</p>
              </div>
            </PopCard>
          </div>
        </FlowReveal>

        {/* 6 — News & media */}
        <FlowReveal className="section-band bg-[#eef3f1]">
          <div className="container-wide">
            <div data-touchline-node className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <SectionHeader
                  eyebrow="News & media"
                  title="From the training ground to the touchline."
                  copy="Match reports, club announcements, events, and highlights from across the Astra community - a content hub for the whole season."
                />
                <div className="mt-8 grid gap-4">
                  {newsPreview.map((item, index) => (
                    <PopCard key={item.title} className="card-plain p-6" delay={index * 0.05}>
                      <p className="text-xs font-black uppercase tracking-normal text-astra-red">{item.kicker}</p>
                      <h3 className="mt-3 text-2xl font-black leading-tight text-astra-ink">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{item.copy}</p>
                    </PopCard>
                  ))}
                </div>
              </div>
              <PopCard className="overflow-hidden rounded border border-astra-ink/12 bg-astra-ink shadow-crest">
                <Image
                  src={photos.news.src}
                  alt={photos.news.alt}
                  width={1280}
                  height={853}
                  placeholder="blur"
                  blurDataURL={photos.news.blurDataURL}
                  className="h-[300px] w-full object-cover"
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
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

        {/* 7 — Sponsors */}
        <FlowReveal className="section-band bg-astra-ink text-white">
          <div data-touchline-node className="container-wide">
            <SectionHeader
              eyebrow="Sponsors"
              title="Support grassroots football in Melbourne's north."
              copy="When you partner with Astra you invest in the health, development, and future of young people across Melbourne's north - more than a logo on a shirt."
              inverse
            />
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {sponsorTiers.map((tier, index) => (
                <PopCard key={tier.title} className="rounded border border-white/12 bg-white/6 p-6 backdrop-blur" delay={index * 0.05}>
                  <ShieldCheck aria-hidden="true" className="mb-5 h-7 w-7 text-astra-gold" />
                  <h3 className="text-xl font-black text-white">{tier.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/72">{tier.copy}</p>
                </PopCard>
              ))}
            </div>
            <Link
              href="/sponsors"
              className="mt-9 inline-flex items-center gap-2 rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              View sponsorship packages
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </FlowReveal>

        {/* 8 — Join / contact CTA */}
        <FlowReveal className="section-band bg-white">
          <div data-touchline-node className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeader
              eyebrow="Join Astra"
              title="Ready to lace up your boots?"
              copy="Registration is open for the 2026 season. Join as a player, coach, volunteer, or community partner - we train and play at Darebin International Sports Centre."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PopCard>
                <Link href="/join-us" className="group block h-full rounded border border-astra-ink/12 bg-astra-white p-6 text-astra-ink transition hover:-translate-y-1 hover:shadow-crest">
                  <Users aria-hidden="true" className="mb-5 h-7 w-7 text-astra-red" />
                  <h3 className="text-xl font-black">Register or trial</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">Player registration, open trials, and development pathway information for the 2026 season.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-astra-red">
                    Start here <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </PopCard>
              <PopCard delay={0.08}>
                <Link href="/contact" className="group block h-full rounded border border-astra-ink/12 bg-astra-white p-6 text-astra-ink transition hover:-translate-y-1 hover:shadow-crest">
                  <MapPin aria-hidden="true" className="mb-5 h-7 w-7 text-astra-red" />
                  <h3 className="text-xl font-black">Darebin International Sports Centre</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-700">281 Darebin Road, Thornbury VIC 3071. Reach us for registration, sponsorship, volunteering, or media.</p>
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
