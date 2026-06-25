"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { DAY_INDEX, WEEK } from "@/src/lib/content/schedule";
import type { SpecialEvent, TrainingSession, Weekday } from "@/src/lib/content/types";

// "17:00" -> "5:00pm" (lower-case meridiem, no space — compact for chips).
function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const mer = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}${mer}`;
}

// "2026-07-12" -> "Sat 12 Jul" (parsed as local midnight, not UTC).
function fmtDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

function relativeDay(daysUntil: number): string {
  if (daysUntil <= 0) return "today";
  if (daysUntil === 1) return "tomorrow";
  if (daysUntil < 7) return `in ${daysUntil} days`;
  return `in ${Math.round(daysUntil / 7)} week${daysUntil >= 14 ? "s" : ""}`;
}

const isMatchDay = (group: string) => /match/i.test(group);

type LiveStatus = {
  todayKey: Weekday | null;
  live: TrainingSession | null;
  next: { session: TrainingSession; daysUntil: number } | null;
};

// Pure: derive "what's on now / next" from the sessions and the current moment.
function computeStatus(training: TrainingSession[], now: Date): LiveStatus {
  const dow = now.getDay();
  const todayKey = WEEK.find((d) => DAY_INDEX[d.key] === dow)?.key ?? null;
  let live: TrainingSession | null = null;
  let next: { session: TrainingSession; time: number } | null = null;

  for (const s of training) {
    const delta = (DAY_INDEX[s.day] - dow + 7) % 7;
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    const start = new Date(now);
    start.setDate(now.getDate() + delta);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(start);
    end.setHours(eh, em, 0, 0);

    if (delta === 0 && start.getTime() <= now.getTime() && now.getTime() <= end.getTime()) {
      live = s;
    }
    let startTime = start.getTime();
    if (delta === 0 && startTime < now.getTime()) startTime += 7 * 86400000; // already happened today → next week
    if (startTime >= now.getTime() && (next === null || startTime < next.time)) {
      next = { session: s, time: startTime };
    }
  }

  let nextOut: LiveStatus["next"] = null;
  if (next) {
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sd = new Date(next.time);
    const b = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate()).getTime();
    nextOut = { session: next.session, daysUntil: Math.round((b - a) / 86400000) };
  }
  return { todayKey, live, next: nextOut };
}

/**
 * "This Week at Astra" — a live training & events strip. The weekly grid is
 * deterministic from props (renders on the server); the live accents (today's
 * column, the NEXT/LIVE pill, relative times, upcoming-events filter) are derived
 * from the visitor's own clock AFTER mount, so first paint matches the server and
 * there's no hydration mismatch. Reduced motion drops the pulse only.
 */
export function WeeklySchedule({
  training,
  specialEvents
}: {
  training: TrainingSession[];
  specialEvents: SpecialEvent[];
}) {
  const [now, setNow] = useState<Date | null>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000); // keep "live/next" fresh
    return () => clearInterval(id);
  }, []);

  // Group sessions by weekday, each sorted by start time.
  const byDay = useMemo(() => {
    const map: Record<Weekday, TrainingSession[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    for (const s of training) map[s.day]?.push(s);
    for (const key of Object.keys(map) as Weekday[]) map[key].sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [training]);

  const status = now ? computeStatus(training, now) : null;

  // Upcoming events: before mount show the soonest by date; after mount filter out
  // anything before today. (Identical first render server↔client.)
  const sortedEvents = useMemo(
    () => [...specialEvents].sort((a, b) => a.date.localeCompare(b.date)),
    [specialEvents]
  );
  const upcoming = useMemo(() => {
    if (!now) return sortedEvents.slice(0, 4);
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return sortedEvents.filter((e) => e.date >= todayStr).slice(0, 4);
  }, [sortedEvents, now]);

  // Auto-focus today's column on narrow screens once we know the day.
  useEffect(() => {
    if (status?.todayKey && todayRef.current && window.matchMedia("(max-width: 1023px)").matches) {
      todayRef.current.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, [status?.todayKey]);

  return (
    <div>
      {/* header + live pill */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="crest-type text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
            This <span className="text-astra-red">Week</span> at Astra
          </h2>
          <p className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-astra-gold sm:text-xl">
            Training days, times &amp; special events
          </p>
        </div>
        <LivePill status={status} />
      </div>

      {/* weekly grid — horizontal scroll on mobile, 7-up on desktop */}
      <div className="mt-9 flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-7 lg:overflow-visible lg:pb-0">
        {WEEK.map((day) => {
          const sessions = byDay[day.key];
          const isToday = status?.todayKey === day.key;
          return (
            <div
              key={day.key}
              ref={isToday ? todayRef : undefined}
              className={`flex min-w-[8.75rem] snap-start flex-col rounded-2xl p-3 ring-1 transition lg:min-w-0 ${
                isToday
                  ? "bg-gradient-to-b from-[#10355c] to-[#0a1f38] ring-astra-gold/45 shadow-[0_0_30px_-10px_rgba(242,201,76,0.5)]"
                  : "bg-gradient-to-b from-[#0d2c4d] to-[#06141f] ring-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-[0.14em] ${isToday ? "text-astra-gold" : "text-white/55"}`}>
                  {day.short}
                </span>
                {isToday ? (
                  <span className="rounded-full bg-astra-gold px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wide text-astra-ink">
                    Today
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-1 flex-col gap-2">
                {sessions.length === 0 ? (
                  <span className="text-xs text-white/30">Rest day</span>
                ) : (
                  sessions.map((s) => {
                    const match = isMatchDay(s.group);
                    return (
                      <div
                        key={s.id}
                        className={`rounded-xl px-2.5 py-2 ring-1 ${
                          match ? "bg-astra-red/15 ring-astra-red/40" : "bg-white/5 ring-white/10"
                        }`}
                      >
                        <p className={`text-xs font-black leading-tight ${match ? "text-white" : "text-white/90"}`}>
                          {s.group}
                        </p>
                        <p className="mt-1 text-[0.7rem] font-semibold text-astra-gold">
                          {fmtTime(s.start)}–{fmtTime(s.end)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* upcoming special events rail */}
      {upcoming.length > 0 ? (
        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-astra-gold">★ Upcoming events</p>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {upcoming.map((ev) => (
              <div
                key={ev.id}
                className="min-w-[15rem] rounded-2xl bg-gradient-to-br from-[#0d2c4d] to-[#06141f] p-4 ring-1 ring-astra-gold/20 sm:min-w-0"
              >
                <p className="text-xs font-black uppercase tracking-[0.12em] text-astra-gold">{fmtDate(ev.date)}</p>
                <p className="mt-1.5 text-base font-black leading-tight text-white">{ev.title}</p>
                <div className="mt-2 space-y-1 text-xs text-white/60">
                  {ev.start ? (
                    <p>
                      {fmtTime(ev.start)}
                      {ev.end ? `–${fmtTime(ev.end)}` : ""}
                    </p>
                  ) : null}
                  {ev.location ? (
                    <p className="flex items-center gap-1.5">
                      <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-astra-red" />
                      {ev.location}
                    </p>
                  ) : null}
                  {ev.note ? <p className="text-white/45">{ev.note}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** The live status pill — pulsing dot + "LIVE NOW" / "NEXT" / fallback. */
function LivePill({ status }: { status: LiveStatus | null }) {
  let dotClass = "bg-white/40";
  let label = <span className="text-white/70">Training &amp; events below</span>;

  if (status?.live) {
    dotClass = "bg-astra-red";
    label = (
      <span className="text-white">
        <span className="font-black text-astra-red">LIVE NOW</span> — {status.live.group} training
      </span>
    );
  } else if (status?.next) {
    const { session, daysUntil } = status.next;
    const dayLong = WEEK.find((d) => d.key === session.day)?.long ?? "";
    dotClass = "bg-astra-gold";
    label = (
      <span className="text-white">
        <span className="font-black text-astra-gold">NEXT</span> — {session.group} · {dayLong} {fmtTime(session.start)}{" "}
        <span className="text-white/55">· {relativeDay(daysUntil)}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-white/15 bg-astra-ink/60 px-4 py-2 text-sm sm:self-auto">
      <span className="relative flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping ${dotClass}`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotClass}`} />
      </span>
      {label}
    </div>
  );
}
