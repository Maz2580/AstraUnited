"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Notice } from "@/src/lib/content/types";

const SEEN_KEY = "astra-urgent-seen";

function todaysSeen(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/**
 * Club announcements as a gold marquee band pinned under the nav (designer's t10):
 * created in the admin, they scroll across the top for maximum visibility. The
 * band is a button — tapping it opens the full notice(s) in a modal, and urgent
 * notices still auto-open once per day. Falls back to a static row under reduced
 * motion (the .marquee-track animation is disabled globally there).
 */
export function NoticeMarquee({ notices }: { notices: Notice[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Urgent notices still pop the modal once per day, even with the band visible.
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const seen = todaysSeen();
    const unseenUrgent = notices.filter((n) => n.kind === "urgent" && seen[n.id] !== today);
    if (unseenUrgent.length > 0) {
      setOpen(true);
      try {
        const next = { ...seen };
        for (const n of unseenUrgent) next[n.id] = today;
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        /* private browsing: just open, don't persist */
      }
    }
  }, [notices]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  const current = notices[Math.min(index, notices.length - 1)];
  const step = useCallback(
    (d: number) => setIndex((i) => (i + d + notices.length) % notices.length),
    [notices.length]
  );

  // Repeat the notices so the track fills the width even for a single short
  // notice; .marquee-track then duplicates it (-50%) for a seamless loop.
  const reps = Math.max(2, Math.ceil(8 / notices.length));
  const copy = Array.from({ length: reps }).flatMap(() => notices);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="notice-marquee block w-full text-astra-ink"
        aria-label={`Club announcements — ${notices.length} notice${notices.length > 1 ? "s" : ""}, tap to read`}
      >
        <div className="marquee-track py-2" aria-hidden="true">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex shrink-0 items-center">
              {copy.map((n, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center text-xs font-black uppercase tracking-[0.16em] sm:text-sm"
                >
                  <Megaphone aria-hidden="true" className="mx-3 h-4 w-4 shrink-0" />
                  {n.kind === "urgent" ? (
                    <span className="mr-2 rounded-sm bg-astra-red px-1.5 py-0.5 text-[0.6rem] leading-none text-white">
                      Urgent
                    </span>
                  ) : null}
                  <span className="whitespace-nowrap font-black">{n.title}</span>
                  <span className="px-2 text-astra-ink/40">—</span>
                  <span className="whitespace-nowrap font-semibold normal-case tracking-normal text-astra-ink/80">
                    {n.message}
                  </span>
                  <span className="px-4 text-astra-ink/45">•</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Club notice"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-astra-ink/95 px-5 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div className="card-dark relative w-full max-w-lg p-7" onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close notice"
              className="absolute right-4 top-4 rounded-full border border-white/12 p-2 text-white/70 transition hover:border-white/35 hover:text-white"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <p
              className={`text-xs font-black uppercase tracking-[0.14em] ${current.kind === "urgent" ? "text-astra-red" : "text-astra-gold"}`}
            >
              {current.kind === "urgent" ? "Urgent" : "Club notice"}
            </p>
            <h2 className="crest-type mt-3 text-3xl text-white">{current.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">{current.message}</p>
            {notices.length > 1 ? (
              <div className="mt-6 flex items-center justify-between text-white/70">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous notice"
                  className="rounded-full border border-white/12 p-2 transition hover:border-white/35 hover:text-white"
                >
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold">
                  {index + 1} / {notices.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next notice"
                  className="rounded-full border border-white/12 p-2 transition hover:border-white/35 hover:text-white"
                >
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
