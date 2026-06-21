import { Trophy } from "lucide-react";
import { FlowReveal, PopCard } from "@/src/components/FlowReveal";
import { SectionHeader } from "@/src/components/SectionHeader";
import { WomensMotionCard } from "@/src/components/WomensMotionCard";

const SENIOR_TEAMS = ["Men's First Team", "Women's First Team", "Under-23s"];

/**
 * Senior pathway feature (Men's / Women's / U23) with the women's motion card.
 * Moved off the homepage onto the Programs (/teams) page (t12) — it's the senior
 * end of the academy pathway, more at home there. `band` lets the host page keep
 * its deep/fog rhythm.
 */
export function SeniorPathway({ band = "band-deep" }: { band?: string }) {
  return (
    <FlowReveal className={`section-band ${band}`}>
      <div className="container-wide grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Senior pathway"
            title="Men's, women's, and U23 football."
            copy="The senior program gives emerging players a competitive destination and shows families that the academy has a real long-term pathway."
            inverse
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SENIOR_TEAMS.map((team, index) => (
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
            <p className="text-xs font-black uppercase tracking-normal text-astra-gold">Women&apos;s First Team</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              A growing women&apos;s program at Darebin International Sports Centre.
            </p>
          </div>
        </PopCard>
      </div>
    </FlowReveal>
  );
}
