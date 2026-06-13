"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-astra-ink px-5 py-16 text-white">
      <div className="container-wide">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">Admin</p>
        <h1 className="crest-type mt-2 text-3xl text-white">Something went wrong</h1>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          {error.message || "That action couldn't be completed. Your other content is unaffected."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-wide text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
