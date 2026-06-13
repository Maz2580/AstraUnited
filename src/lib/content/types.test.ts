import { describe, expect, it } from "vitest";
import { parseEvents, parseNotices, parsePhotoOverrides } from "./types";

describe("content parsing", () => {
  it("parses a valid notices payload", () => {
    const parsed = parseNotices(
      JSON.stringify([
        {
          id: "n1",
          title: "Training cancelled tonight",
          message: "Heavy rain at DISC — all U6-U12 sessions are off.",
          kind: "urgent",
          activeUntil: "2026-06-14T10:00:00.000Z",
          createdAt: "2026-06-13T05:00:00.000Z"
        }
      ])
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0].kind).toBe("urgent");
  });

  it("falls back to empty on malformed JSON", () => {
    expect(parseNotices("{not json")).toEqual([]);
    expect(parseEvents("[{\"id\":1}]")).toEqual([]);
    expect(parsePhotoOverrides("null")).toEqual({});
  });

  it("parses photo overrides map", () => {
    const parsed = parsePhotoOverrides(
      JSON.stringify({ "home-welcome": { url: "https://x.public.blob.vercel-storage.com/photos/a.webp", updatedAt: "2026-06-13T05:00:00.000Z" } })
    );
    expect(parsed["home-welcome"].url).toContain("blob.vercel-storage.com");
  });

  const event = (overrides: Record<string, unknown> = {}) => ({
    id: "e1",
    image: "https://x.public.blob.vercel-storage.com/events/e1.webp",
    headline: "Mother's Day Special",
    body: "20% off all academy registrations this weekend.",
    createdAt: "2026-06-13T05:00:00.000Z",
    ...overrides
  });

  it("parses a valid event post with a relative ctaHref", () => {
    const parsed = parseEvents(JSON.stringify([event({ ctaLabel: "Register", ctaHref: "/join-us" })]));
    expect(parsed).toHaveLength(1);
    expect(parsed[0].ctaHref).toBe("/join-us");
  });

  it("accepts an https ctaHref and no ctaHref at all", () => {
    expect(parseEvents(JSON.stringify([event({ ctaHref: "https://register.example.com" })]))).toHaveLength(1);
    expect(parseEvents(JSON.stringify([event()]))).toHaveLength(1);
  });

  it("rejects dangerous ctaHref schemes (feed falls back to empty)", () => {
    expect(parseEvents(JSON.stringify([event({ ctaHref: "javascript:alert(1)" })]))).toEqual([]);
    expect(parseEvents(JSON.stringify([event({ ctaHref: "data:text/html,<script>" })]))).toEqual([]);
    expect(parseEvents(JSON.stringify([event({ ctaHref: "//evil.com" })]))).toEqual([]);
  });
});
