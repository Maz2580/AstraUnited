import { describe, expect, it } from "vitest";
import { PHOTO_SLOTS, resolvePhoto, type SlotKey } from "./photo-slots";

describe("photo slots", () => {
  it("has the expected slot keys", () => {
    const keys = PHOTO_SLOTS.map((s) => s.key);
    expect(keys).toEqual([
      "home-welcome",
      "home-academy-mini",
      "home-academy-junior",
      "home-academy-youth",
      "home-news",
      "hero-the-club",
      "hero-teams",
      "hero-join-us",
      "hero-news-media",
      "hero-sponsors",
      "hero-contact"
    ]);
  });

  it("every slot has a default image and label", () => {
    for (const slot of PHOTO_SLOTS) {
      expect(slot.label.length).toBeGreaterThan(0);
      expect(slot.default.src).toMatch(/^\/images\/.+\.webp$/);
      expect(slot.default.alt.length).toBeGreaterThan(0);
    }
  });

  it("resolvePhoto returns the override url when present", () => {
    const overrides = { "home-welcome": { url: "https://x.public.blob.vercel-storage.com/p.webp", updatedAt: "2026-06-13T00:00:00.000Z" } };
    const resolved = resolvePhoto("home-welcome", overrides);
    expect(resolved.src).toBe(overrides["home-welcome"].url);
    expect(resolved.isOverride).toBe(true);
    expect(resolved.alt.length).toBeGreaterThan(0); // alt always comes from the registry
  });

  it("resolvePhoto falls back to the default", () => {
    const resolved = resolvePhoto("home-news", {});
    expect(resolved.src).toMatch(/^\/images\//);
    expect(resolved.isOverride).toBe(false);
    expect(resolved.blurDataURL).toBeDefined();
  });
});
