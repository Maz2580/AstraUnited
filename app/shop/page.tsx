import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Future Shop",
  description: "Future shop scaffold for Astra United FC. Product UI and Stripe are intentionally deferred."
};

export default function ShopScaffoldPage() {
  return (
    <main id="main-content" className="bg-astra-white pt-20">
      <section className="field-grid px-5 py-24 text-white sm:py-32">
        <div className="container-wide">
          <p className="mb-4 text-sm font-black uppercase tracking-normal text-astra-gold">Future phase</p>
          <h1 className="crest-type max-w-4xl text-5xl leading-[0.9] sm:text-7xl">Club shop scaffold.</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/76">
            Stripe and product browsing are intentionally not built in Phase 1. The database schema includes products so the shop can be added later without reshaping the project.
          </p>
        </div>
      </section>
      <section className="section-band bg-white">
        <div className="container-wide max-w-3xl">
          <div className="card-plain p-8">
            <ShoppingBag aria-hidden="true" className="mb-5 h-8 w-8 text-astra-red" />
            <h2 className="text-2xl font-black text-astra-ink">No product UI yet</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Future shop content can support official kits, training apparel, supporter wear, and accessories. For now this page documents the planned surface while avoiding Stripe work in this round.
            </p>
            <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-astra-red">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
