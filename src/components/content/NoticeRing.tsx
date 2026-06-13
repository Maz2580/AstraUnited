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

export function NoticeRing({ notices }: { notices: Notice[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hasUrgent = notices.some((n) => n.kind === "urgent");

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
    // Cleanup runs when the dialog closes — restore focus to the ring trigger.
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setIndex(0); setOpen(true); }}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-3"
        aria-label={`Club notices (${notices.length})`}
      >
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-astra-gold bg-astra-ink shadow-[0_0_0_3px_rgba(200,164,77,0.25)] ${hasUrgent ? "animate-pulse motion-reduce:animate-none" : ""}`}
        >
          <Megaphone aria-hidden="true" className="h-6 w-6 text-astra-gold" />
        </span>
        <span className="max-w-[16rem] truncate rounded-full border border-white/12 bg-astra-ink/90 px-3 py-1.5 text-xs font-bold text-white/85">
          {notices[0].title}
        </span>
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
            <p className={`text-xs font-black uppercase tracking-[0.14em] ${current.kind === "urgent" ? "text-astra-red" : "text-astra-gold"}`}>
              {current.kind === "urgent" ? "Urgent" : "Club notice"}
            </p>
            <h2 className="crest-type mt-3 text-3xl text-white">{current.title}</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">{current.message}</p>
            {notices.length > 1 ? (
              <div className="mt-6 flex items-center justify-between text-white/70">
                <button type="button" onClick={() => step(-1)} aria-label="Previous notice" className="rounded-full border border-white/12 p-2 transition hover:border-white/35 hover:text-white">
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold">{index + 1} / {notices.length}</span>
                <button type="button" onClick={() => step(1)} aria-label="Next notice" className="rounded-full border border-white/12 p-2 transition hover:border-white/35 hover:text-white">
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
