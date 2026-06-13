import type { Metadata } from "next";
import Link from "next/link";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { NoticeForm } from "./NoticeForm";
import { deleteNotice, endNotice } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Club admin",
  robots: { index: false, follow: false }
};

type Props = { searchParams?: { tab?: string } };

function statusOf(item: { activeFrom?: string; activeUntil?: string }): "Live" | "Scheduled" | "Expired" {
  const now = new Date();
  if (isLive(item, now)) return "Live";
  if (item.activeFrom && new Date(item.activeFrom) > now) return "Scheduled";
  return "Expired";
}

const STATUS_CLS: Record<string, string> = {
  Live: "text-astra-gold",
  Scheduled: "text-white/60",
  Expired: "text-white/35"
};

const TABS = [
  { key: "notices", label: "Notices" },
  { key: "events", label: "Event posts" },
  { key: "photos", label: "Photos" }
] as const;

export default async function AdminPage({ searchParams }: Props) {
  const tab = searchParams?.tab === "events" || searchParams?.tab === "photos" ? searchParams.tab : "notices";
  const { notices } = await getClubContent();
  const hasWriteConfig = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

  return (
    <main className="min-h-screen bg-astra-ink px-5 py-16 text-white">
      <div className="container-wide">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">Astra United</p>
        <h1 className="crest-type mt-2 text-4xl text-white">Club admin</h1>

        {!hasWriteConfig ? (
          <div className="mt-6 rounded border border-astra-gold/40 bg-astra-gold/10 p-4 text-sm text-white/85">
            Storage write access isn&apos;t configured in this environment, so saving won&apos;t work here. This is
            expected on local dev — publish and upload from the deployed preview instead.
          </div>
        ) : null}

        <nav className="mt-8 flex gap-6 border-b border-white/12">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`?tab=${t.key}`}
              className={`nav-underline pb-3 text-sm font-bold ${tab === t.key ? "text-white" : "text-white/55"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "notices" ? (
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <NoticeForm />
              <div className="grid gap-3">
                {notices.length === 0 ? <p className="text-sm text-white/55">No notices yet.</p> : null}
                {notices.map((n) => {
                  const status = statusOf(n);
                  return (
                    <div key={n.id} className="card-dark p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-xs font-black uppercase tracking-[0.14em] ${n.kind === "urgent" ? "text-astra-red" : "text-astra-gold"}`}>
                          {n.kind}
                        </p>
                        <span className={`text-xs font-bold ${STATUS_CLS[status]}`}>{status}</span>
                      </div>
                      <h3 className="crest-type mt-2 text-2xl text-white">{n.title}</h3>
                      <p className="mt-2 text-sm text-white/72">{n.message}</p>
                      <p className="mt-3 text-xs text-white/45">
                        {n.activeFrom ? `From ${new Date(n.activeFrom).toLocaleString()}` : "From now"}
                        {" · "}
                        {n.activeUntil ? `until ${new Date(n.activeUntil).toLocaleString()}` : "no end"}
                      </p>
                      <div className="mt-4 flex gap-3">
                        {status !== "Expired" ? (
                          <form action={endNotice}>
                            <input type="hidden" name="id" value={n.id} />
                            <button type="submit" className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:text-white">
                              End now
                            </button>
                          </form>
                        ) : null}
                        <form action={deleteNotice}>
                          <input type="hidden" name="id" value={n.id} />
                          <button type="submit" className="rounded border border-astra-red/40 px-3 py-1.5 text-xs font-bold text-astra-red transition hover:border-astra-red hover:text-white">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {tab === "events" ? <p className="text-sm text-white/55">Event posts — set up in the next step.</p> : null}
          {tab === "photos" ? <p className="text-sm text-white/55">Photos — set up in the next step.</p> : null}
        </div>
      </div>
    </main>
  );
}
