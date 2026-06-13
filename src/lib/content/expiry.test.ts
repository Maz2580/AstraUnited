import { describe, expect, it } from "vitest";
import { isLive } from "./expiry";

const at = (s: string) => new Date(s);

describe("isLive", () => {
  const base = { activeFrom: "2026-06-10T00:00:00.000Z", activeUntil: "2026-06-20T00:00:00.000Z" };

  it("is live inside the window", () => {
    expect(isLive(base, at("2026-06-15T12:00:00.000Z"))).toBe(true);
  });
  it("is not live before activeFrom", () => {
    expect(isLive(base, at("2026-06-09T23:59:59.000Z"))).toBe(false);
  });
  it("expires exactly at activeUntil (now < until is required)", () => {
    expect(isLive(base, at("2026-06-20T00:00:00.000Z"))).toBe(false);
  });
  it("starts exactly at activeFrom (from <= now)", () => {
    expect(isLive(base, at("2026-06-10T00:00:00.000Z"))).toBe(true);
  });
  it("no activeUntil means live forever once started", () => {
    expect(isLive({ activeFrom: base.activeFrom }, at("2030-01-01T00:00:00.000Z"))).toBe(true);
  });
  it("no activeFrom means live immediately", () => {
    expect(isLive({ activeUntil: base.activeUntil }, at("2026-06-01T00:00:00.000Z"))).toBe(true);
  });
  it("invalid dates are treated as unset", () => {
    expect(isLive({ activeFrom: "garbage" }, at("2026-06-15T00:00:00.000Z"))).toBe(true);
  });
});
