import { z } from "zod";

export const noticeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  kind: z.enum(["info", "urgent"]),
  activeFrom: z.string().optional(),
  activeUntil: z.string().optional(),
  createdAt: z.string()
});
export type Notice = z.infer<typeof noticeSchema>;

// Per-post design overrides. Colours are strict hex so a stray value can never
// inject CSS; sizes are bounded. All optional — a post without a style renders
// with the default Spotlight look.
const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const eventStyleSchema = z.object({
  bg: z.string().regex(HEX_COLOR).optional(),
  text: z.string().regex(HEX_COLOR).optional(),
  headlineSize: z.number().min(12).max(120).optional(),
  bodySize: z.number().min(10).max(48).optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  imageSide: z.enum(["left", "right", "top"]).optional(),
  imageFit: z.enum(["cover", "contain"]).optional(),
  size: z.enum(["sm", "md", "lg"]).optional()
});
export type EventStyle = z.infer<typeof eventStyleSchema>;

// Where a post shows on the homepage as a featured Spotlight band. Every post is
// also a news article regardless; "none" means news-only (no Spotlight band).
export const placementSchema = z.enum(["none", "top", "mid", "after-news", "before-join"]);
export type Placement = z.infer<typeof placementSchema>;

export const eventPostSchema = z.object({
  id: z.string().min(1),
  image: z.string().url(),
  headline: z.string().min(1),
  body: z.string().min(1),
  // News category shown on the card + article page (e.g. "Match Report").
  category: z.string().max(60).optional(),
  ctaLabel: z.string().optional(),
  // The only field that becomes an href in the DOM. Allowlist http(s):// URLs
  // or a leading-slash relative path; reject javascript:/data:/protocol-relative
  // (//evil.com) at parse time. The admin action validates against this schema
  // before storing, so bad input is rejected at the form rather than silently
  // collapsing the whole events feed on read; SpotlightCard re-checks at render
  // as defence in depth.
  ctaHref: z
    .string()
    .regex(/^(https?:\/\/|\/(?!\/))/, "ctaHref must be a relative path (/...) or an http(s):// URL")
    .optional(),
  placement: placementSchema.optional(),
  style: eventStyleSchema.optional(),
  activeFrom: z.string().optional(),
  activeUntil: z.string().optional(),
  createdAt: z.string()
});
export type EventPost = z.infer<typeof eventPostSchema>;

// --- Schedule: recurring training + dated special events ---------------------
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/; // 24h HH:MM
const DATE = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

// A recurring weekly training slot — set once (e.g. "U10s, Tuesdays, 5–6pm"),
// always current. The widget computes "today / next / live" from these.
export const trainingSessionSchema = z.object({
  id: z.string().min(1),
  group: z.string().min(1).max(60),
  day: z.enum(WEEKDAYS),
  start: z.string().regex(TIME),
  end: z.string().regex(TIME),
  location: z.string().max(80).optional(),
  createdAt: z.string()
});
export type TrainingSession = z.infer<typeof trainingSessionSchema>;

// A one-off dated event (gala day, trials, presentation night).
export const specialEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100),
  date: z.string().regex(DATE),
  start: z.string().regex(TIME).optional(),
  end: z.string().regex(TIME).optional(),
  location: z.string().max(80).optional(),
  note: z.string().max(200).optional(),
  createdAt: z.string()
});
export type SpecialEvent = z.infer<typeof specialEventSchema>;

// Newsletter signup capture. Stored as a simple list; an email service / export
// can be wired on top later. Email is lower-cased + deduped at the write path.
export const subscriberSchema = z.object({
  email: z.string().email().max(160),
  createdAt: z.string()
});
export type Subscriber = z.infer<typeof subscriberSchema>;

export const photoOverridesSchema = z.record(
  z.string(),
  z.object({ url: z.string().url(), updatedAt: z.string() })
);
export type PhotoOverrides = z.infer<typeof photoOverridesSchema>;

// Fail-soft: any JSON or schema error returns the fallback so the public site
// never breaks on bad content.
function safeParse<T>(schema: z.ZodType<T>, raw: string, fallback: T): T {
  try {
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) {
      console.error("[content] schema mismatch:", result.error.issues[0]);
      return fallback;
    }
    return result.data;
  } catch (error) {
    console.error("[content] malformed JSON:", error);
    return fallback;
  }
}

// Parse an array of stored items PER ITEM, keeping the valid ones and skipping
// (logging) only the invalid ones. This deliberately avoids z.array(schema)'s
// all-or-nothing behaviour: there, a SINGLE bad item rejects the whole array and
// the feed falls back to empty — and because the admin write path does
// read-modify-write, that empty read then gets persisted, silently deleting
// every notice/post the admin never touched. The realistic trigger is the Blob
// store shared between preview and prod running different schema versions (e.g.
// a post with the newer placement: "none" is unknown to the older enum). Per-item
// parsing contains the blast radius to just the incompatible item.
function parseItems<T>(itemSchema: z.ZodType<T>, raw: string, label: string): T[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    console.error(`[content] malformed ${label} JSON:`, error);
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: T[] = [];
  for (const entry of data) {
    const result = itemSchema.safeParse(entry);
    if (result.success) out.push(result.data);
    else console.error(`[content] skipping invalid ${label} item:`, result.error.issues[0]);
  }
  return out;
}

export const parseNotices = (raw: string): Notice[] => parseItems(noticeSchema, raw, "notice");
export const parseEvents = (raw: string): EventPost[] => parseItems(eventPostSchema, raw, "event");
export const parseTrainingSessions = (raw: string): TrainingSession[] =>
  parseItems(trainingSessionSchema, raw, "training session");
export const parseSpecialEvents = (raw: string): SpecialEvent[] =>
  parseItems(specialEventSchema, raw, "special event");
export const parseSubscribers = (raw: string): Subscriber[] => parseItems(subscriberSchema, raw, "subscriber");
export const parsePhotoOverrides = (raw: string): PhotoOverrides => safeParse(photoOverridesSchema, raw, {});
