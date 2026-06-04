import { MapPin, Navigation, ShieldCheck } from "lucide-react";

export function GroundPanel() {
  return (
    <div className="ground-panel min-h-[500px] overflow-hidden rounded border border-astra-ink/12 text-white shadow-crest">
      <div
        className="pitch-surface"
        role="img"
        aria-label="Stylised football pitch for Darebin International Sports Centre"
      >
        <div className="pitch-lines">
          <span className="pitch-halfway" />
          <span className="pitch-center-circle" />
          <span className="pitch-center-spot" />
          <span className="pitch-box pitch-box-left" />
          <span className="pitch-box pitch-box-right" />
          <span className="pitch-six pitch-six-left" />
          <span className="pitch-six pitch-six-right" />
          <span className="pitch-spot pitch-spot-left" />
          <span className="pitch-spot pitch-spot-right" />
          <span className="pitch-corner pitch-corner-tl" />
          <span className="pitch-corner pitch-corner-tr" />
          <span className="pitch-corner pitch-corner-bl" />
          <span className="pitch-corner pitch-corner-br" />
        </div>
        <span className="player-dot player-dot-red player-dot-one" />
        <span className="player-dot player-dot-light player-dot-two" />
        <span className="player-dot player-dot-light player-dot-three" />
        <span className="player-dot player-dot-gold player-dot-four" />
        <span className="ground-route" />
      </div>

      <div className="ground-panel-top">
        <div>
          <p className="text-[11px] font-black uppercase tracking-normal text-astra-gold">Home ground</p>
          <h3 className="mt-2 text-xl font-black leading-tight">Darebin International Sports Centre</h3>
        </div>
        <div className="rounded bg-white/10 p-2">
          <ShieldCheck aria-hidden="true" className="h-5 w-5 text-astra-gold" />
        </div>
      </div>

      <div className="ground-panel-bottom">
        <div className="flex items-start gap-3">
          <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-astra-red" />
          <div>
            <p className="text-sm font-black">281 Darebin Road, Thornbury VIC 3071</p>
            <p className="mt-1 text-xs leading-5 text-white/66">Training, match day, academy sessions, and senior pathway activity.</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded border border-white/14 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-normal text-white/78 sm:flex">
          <Navigation aria-hidden="true" className="h-4 w-4 text-astra-gold" />
          Melbourne north
        </div>
      </div>
    </div>
  );
}
