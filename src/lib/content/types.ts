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

export const eventPostSchema = z.object({
  id: z.string().min(1),
  image: z.string().url(),
  headline: z.string().min(1),
  body: z.string().min(1),
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
  activeFrom: z.string().optional(),
  activeUntil: z.string().optional(),
  createdAt: z.string()
});
export type EventPost = z.infer<typeof eventPostSchema>;

export const photoOverridesSchema = z.record(
  z.string(),
  z.object({ url: z.string().url(), updatedAt: z.string() })
);
export type PhotoOverrides = z.infer<typeof photoOverridesSchema>;

// Fail-soft: any JSON or schema error returns the fallback so the public site
// never breaks on bad content. Note the all-or-nothing array behaviour — if a
// single item in a notices/events array fails validation, z.array rejects the
// whole array and the feed falls back to empty. Acceptable for a single-admin
// club site; temporal fields stay loose here and are guarded at write time.
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

export const parseNotices = (raw: string): Notice[] => safeParse(z.array(noticeSchema), raw, []);
export const parseEvents = (raw: string): EventPost[] => safeParse(z.array(eventPostSchema), raw, []);
export const parsePhotoOverrides = (raw: string): PhotoOverrides => safeParse(photoOverridesSchema, raw, {});
