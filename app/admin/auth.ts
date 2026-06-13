// Server-only by construction: uses next/headers cookies() + node crypto, and
// nothing in a client component imports this module.
import { cookies } from "next/headers";
import { createHash } from "crypto";

export const ADMIN_COOKIE = "astra_admin";

/** SHA-256 of the configured password, or null if ADMIN_PASSWORD isn't set. */
export function adminToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(pw).digest("hex");
}

/** Constant-ish check of a submitted password against the configured one. */
export function passwordMatches(input: string): boolean {
  const token = adminToken();
  if (!token) return false;
  return createHash("sha256").update(input).digest("hex") === token;
}

/** True when the request carries a valid admin session cookie. */
export function isAdmin(): boolean {
  const token = adminToken();
  return token !== null && cookies().get(ADMIN_COOKIE)?.value === token;
}
