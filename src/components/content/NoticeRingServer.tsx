import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { NoticeRing } from "./NoticeRing";

export async function NoticeRingServer() {
  const { notices } = await getClubContent();
  const live = notices
    .filter((n) => isLive(n, new Date()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (live.length === 0) return null;
  return <NoticeRing notices={live} />;
}
