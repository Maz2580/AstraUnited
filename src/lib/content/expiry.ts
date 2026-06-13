export type ActiveWindow = { activeFrom?: string; activeUntil?: string };

function toTime(value: string | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

/** Read-time auto-expiry: live iff activeFrom <= now < activeUntil (unset bounds are open). */
export function isLive(item: ActiveWindow, now: Date): boolean {
  const t = now.getTime();
  const from = toTime(item.activeFrom);
  const until = toTime(item.activeUntil);
  if (from !== null && t < from) return false;
  if (until !== null && t >= until) return false;
  return true;
}
