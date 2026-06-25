import type { Metadata } from "next";
import Link from "next/link";
import { getClubContent } from "@/src/lib/content/store";
import { isLive } from "@/src/lib/content/expiry";
import { NoticeForm } from "./NoticeForm";
import { ConfirmDeleteButton } from "./ConfirmDeleteButton";
import { EventForm } from "./EventForm";
import { TrainingForm, SpecialEventForm } from "./ScheduleForms";
import {
  endNotice,
  endEvent,
  deleteEvent,
  deleteNotice,
  deleteSpecialEvent,
  deleteSubscriber,
  deleteTrainingSession,
  logout
} from "./actions";
import { PhotoSlotCard } from "./PhotoSlotCard";
import { PHOTO_SLOTS, resolvePhoto } from "@/src/lib/content/photo-slots";
import { DEFAULT_SPECIAL_EVENTS, DEFAULT_TRAINING, WEEK } from "@/src/lib/content/schedule";
import { isAdmin } from "./auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Club admin",
  robots: { index: false, follow: false }
};

type Props = { searchParams?: { tab?: string; edit?: string } };

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

// Times are stored as UTC ISO; show the club's local (Melbourne) wall time.
const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-AU", { timeZone: "Australia/Melbourne", dateStyle: "medium", timeStyle: "short" });

const TABS = [
  { key: "notices", label: "Notices" },
  { key: "events", label: "News posts" },
  { key: "schedule", label: "Schedule" },
  { key: "subscribers", label: "Subscribers" },
  { key: "photos", label: "Photos" }
] as const;

export default async function AdminPage({ searchParams }: Props) {
  if (!isAdmin()) return <LoginForm />;

  const requested = searchParams?.tab ?? "";
  const tab = (["events", "schedule", "subscribers", "photos"].includes(requested) ? requested : "notices") as
    | "notices"
    | "events"
    | "schedule"
    | "subscribers"
    | "photos";
  const { notices, events, training, specialEvents, subscribers, photoOverrides } = await getClubContent();
  const editingNotice =
    tab === "notices" && searchParams?.edit ? notices.find((n) => n.id === searchParams.edit) : undefined;
  const editingEvent =
    tab === "events" && searchParams?.edit ? events.find((e) => e.id === searchParams.edit) : undefined;
  const hasWriteConfig = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

  return (
    <main className="min-h-screen bg-astra-ink px-5 pb-16 pt-32 text-white">
      <div className="container-wide">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-gold">Astra United</p>
            <h1 className="crest-type mt-2 text-4xl text-white">Club admin</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/35 hover:text-white">
              Sign out
            </button>
          </form>
        </div>

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
              <NoticeForm key={editingNotice?.id ?? "new"} initial={editingNotice} />
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
                        {n.activeFrom ? `From ${fmt(n.activeFrom)}` : "From now"}
                        {" · "}
                        {n.activeUntil ? `until ${fmt(n.activeUntil)}` : "no end"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`?tab=notices&edit=${n.id}`}
                          className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:text-white"
                        >
                          Edit
                        </Link>
                        {status !== "Expired" ? (
                          <form action={endNotice}>
                            <input type="hidden" name="id" value={n.id} />
                            <button type="submit" className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:text-white">
                              End now
                            </button>
                          </form>
                        ) : null}
                        <ConfirmDeleteButton id={n.id} action={deleteNotice} noun="notice" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {tab === "events" ? (
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <EventForm key={editingEvent?.id ?? "new"} initial={editingEvent} />
              <div className="grid gap-3">
                {events.length === 0 ? <p className="text-sm text-white/55">No event posts yet.</p> : null}
                {events.map((ev) => {
                  const status = statusOf(ev);
                  return (
                    <div key={ev.id} className="card-dark flex gap-4 p-5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ev.image} alt="" className="h-20 w-24 shrink-0 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="crest-type truncate text-xl text-white">{ev.headline}</h3>
                          <span className={`shrink-0 text-xs font-bold ${STATUS_CLS[status]}`}>{status}</span>
                        </div>
                        <p className="mt-1 text-xs text-white/45">
                          {ev.category || "Club News"}
                          {" · "}
                          {ev.placement && ev.placement !== "none" ? "News + featured spotlight" : "News only"}
                        </p>
                        <p className="mt-0.5 text-xs text-white/45">
                          {ev.activeFrom ? `From ${fmt(ev.activeFrom)}` : "From now"}
                          {" · "}
                          {ev.activeUntil ? `until ${fmt(ev.activeUntil)}` : "no end"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <Link
                            href={`?tab=events&edit=${ev.id}`}
                            className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:text-white"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/news-media/${ev.id}`}
                            target="_blank"
                            className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:text-white"
                          >
                            View post
                          </Link>
                          {status !== "Expired" ? (
                            <form action={endEvent}>
                              <input type="hidden" name="id" value={ev.id} />
                              <button type="submit" className="rounded border border-white/15 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:text-white">
                                End now
                              </button>
                            </form>
                          ) : null}
                          <ConfirmDeleteButton id={ev.id} action={deleteEvent} noun="post" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          {tab === "schedule" ? (
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="grid gap-6">
                <TrainingForm />
                <SpecialEventForm />
              </div>
              <div className="grid gap-8">
                <div>
                  <h3 className="crest-type mb-3 text-xl text-white">Weekly training</h3>
                  {training.length === 0 ? (
                    <p className="mb-3 rounded border border-astra-gold/30 bg-astra-gold/5 p-3 text-xs text-white/70">
                      The site is showing a <strong>sample schedule</strong>. Add your first session to replace it
                      with the club&apos;s real training times.
                    </p>
                  ) : null}
                  <div className="grid gap-2">
                    {(training.length ? training : DEFAULT_TRAINING).map((t) => {
                      const isSample = training.length === 0;
                      const dayLabel = WEEK.find((d) => d.key === t.day)?.long ?? t.day;
                      return (
                        <div key={t.id} className="card-dark flex items-center justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{t.group}</p>
                            <p className="mt-0.5 text-xs text-white/55">
                              {dayLabel} · {t.start}–{t.end}
                              {t.location ? ` · ${t.location}` : ""}
                            </p>
                          </div>
                          {isSample ? (
                            <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-white/35">Sample</span>
                          ) : (
                            <ConfirmDeleteButton id={t.id} action={deleteTrainingSession} noun="session" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="crest-type mb-3 text-xl text-white">Special events</h3>
                  {specialEvents.length === 0 ? (
                    <p className="mb-3 rounded border border-astra-gold/30 bg-astra-gold/5 p-3 text-xs text-white/70">
                      Showing <strong>sample events</strong>. Add your first event to replace them.
                    </p>
                  ) : null}
                  <div className="grid gap-2">
                    {(specialEvents.length ? specialEvents : DEFAULT_SPECIAL_EVENTS).map((ev) => {
                      const isSample = specialEvents.length === 0;
                      return (
                        <div key={ev.id} className="card-dark flex items-center justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{ev.title}</p>
                            <p className="mt-0.5 text-xs text-white/55">
                              {ev.date}
                              {ev.start ? ` · ${ev.start}` : ""}
                              {ev.location ? ` · ${ev.location}` : ""}
                            </p>
                          </div>
                          {isSample ? (
                            <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-white/35">Sample</span>
                          ) : (
                            <ConfirmDeleteButton id={ev.id} action={deleteSpecialEvent} noun="event" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {tab === "subscribers" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="card-dark h-fit p-6">
                <h2 className="crest-type text-2xl text-white">Newsletter subscribers</h2>
                <p className="mt-2 text-sm text-white/60">
                  {subscribers.length} {subscribers.length === 1 ? "person has" : "people have"} signed up from the
                  homepage. An email service or export can be connected on top of this later.
                </p>
                {subscribers.length > 0 ? (
                  <label className="mt-5 grid gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/60">
                      All emails (copy &amp; paste into your mail tool)
                    </span>
                    <textarea
                      readOnly
                      rows={5}
                      value={subscribers.map((s) => s.email).join(", ")}
                      className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
                    />
                  </label>
                ) : null}
              </div>
              <div className="grid gap-2">
                {subscribers.length === 0 ? <p className="text-sm text-white/55">No subscribers yet.</p> : null}
                {[...subscribers]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((s) => (
                    <div key={s.email} className="card-dark flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{s.email}</p>
                        <p className="mt-0.5 text-xs text-white/45">Joined {fmt(s.createdAt)}</p>
                      </div>
                      <ConfirmDeleteButton id={s.email} action={deleteSubscriber} noun="subscriber" />
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
          {tab === "photos" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {PHOTO_SLOTS.map((s) => {
                const resolved = resolvePhoto(s.key, photoOverrides);
                return (
                  <PhotoSlotCard
                    key={s.key}
                    slot={{ key: s.key, label: s.label }}
                    currentUrl={resolved.src}
                    isOverride={resolved.isOverride}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
