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
});
