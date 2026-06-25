import type { SpecialEvent, TrainingSession, Weekday } from "./types";

// Display order + labels for the weekly strip (Mon → Sun).
export const WEEK: { key: Weekday; short: string; long: string }[] = [
  { key: "mon", short: "Mon", long: "Monday" },
  { key: "tue", short: "Tue", long: "Tuesday" },
  { key: "wed", short: "Wed", long: "Wednesday" },
  { key: "thu", short: "Thu", long: "Thursday" },
  { key: "fri", short: "Fri", long: "Friday" },
  { key: "sat", short: "Sat", long: "Saturday" },
  { key: "sun", short: "Sun", long: "Sunday" }
];

// JS Date.getDay() is 0=Sun..6=Sat; map to our Mon-first Weekday keys.
export const DAY_INDEX: Record<Weekday, number> = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0
};

// Realistic PLACEHOLDER training schedule, shown until the club publishes its own
// in /admin (the moment any real session is saved, these defaults drop out — same
// fallback rule as the sample news posts). Times are local (Melbourne) wall time.
export const DEFAULT_TRAINING: TrainingSession[] = [
  { id: "seed-u8-tue", group: "U8 – U10", day: "tue", start: "17:00", end: "18:00", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-u8-thu", group: "U8 – U10", day: "thu", start: "17:00", end: "18:00", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-u11-tue", group: "U11 – U13", day: "tue", start: "18:00", end: "19:15", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-u11-thu", group: "U11 – U13", day: "thu", start: "18:00", end: "19:15", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-snr-wed", group: "U14 – Seniors", day: "wed", start: "19:00", end: "20:30", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-snr-fri", group: "U14 – Seniors", day: "fri", start: "19:00", end: "20:30", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-match-sat", group: "Match Day", day: "sat", start: "09:00", end: "13:00", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" }
];

// PLACEHOLDER special events. Dated entries naturally age out of the upcoming
// rail; the club replaces them with the real fixtures in /admin.
export const DEFAULT_SPECIAL_EVENTS: SpecialEvent[] = [
  { id: "seed-gala", title: "Community Gala Day", date: "2026-07-12", start: "09:00", location: "DISC Darebin", note: "All age groups — family day", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-trials", title: "Winter Trials — 2027 squads", date: "2026-07-26", start: "10:00", location: "DISC Darebin", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "seed-presentation", title: "Presentation Night", date: "2026-08-15", start: "18:00", location: "Darebin Clubrooms", note: "Awards & end-of-season celebration", createdAt: "2026-01-01T00:00:00.000Z" }
];

/**
 * Resolve what the homepage strip shows: the club's published schedule, or the
 * seeded placeholders while nothing is published yet. All-or-nothing per type
 * (matches the sample-posts fallback) — once the club saves even one real
 * session, the placeholder set for that type drops out entirely.
 */
export function resolveSchedule(stored: {
  training: TrainingSession[];
  specialEvents: SpecialEvent[];
}): { training: TrainingSession[]; specialEvents: SpecialEvent[]; usingDefaults: boolean } {
  const training = stored.training.length ? stored.training : DEFAULT_TRAINING;
  const specialEvents = stored.specialEvents.length ? stored.specialEvents : DEFAULT_SPECIAL_EVENTS;
  const usingDefaults = !stored.training.length && !stored.specialEvents.length;
  return { training, specialEvents, usingDefaults };
}
