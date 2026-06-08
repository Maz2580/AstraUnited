import { describe, expect, it } from "vitest";
import { pages, getPageBySlug } from "./site-data";

describe("marketing pages", () => {
  it("every page has a hero image and at least one block", () => {
    for (const page of pages) {
      expect(page.hero.src).toMatch(/^\/images\/.+\.webp$/);
      expect(page.blocks.length).toBeGreaterThan(0);
    }
  });

  it("getPageBySlug finds known pages and rejects unknown", () => {
    expect(getPageBySlug("the-club")?.navLabel).toBe("The Club");
    expect(getPageBySlug("contact")?.slug).toBe("contact");
    expect(getPageBySlug("does-not-exist")).toBeUndefined();
  });

  it("every form block mails the club address", () => {
    const forms = pages.flatMap((p) => p.blocks).filter((b) => b.type === "form");
    expect(forms.length).toBeGreaterThan(0);
    for (const f of forms) {
      if (f.type === "form") expect(f.mailto).toBe("info@astraunitedfootballclub.com");
    }
  });
});
