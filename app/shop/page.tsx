import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Club Shop",
  description: "Official Astra United FC club shop - kits, training apparel, and supporter wear coming soon."
};

export default function ShopPage() {
  return (
    <main id="main-content" className="bg-astra-white pt-20">
      <section className="field-grid px-5 py-24 text-white sm:py-32">
        <div className="container-wide">
          <p className="mb-4 text-sm font-black uppercase tracking-normal text-astra-gold">Coming soon</p>
          <h1 className="crest-type max-w-4xl text-5xl leading-[0.9] sm:text-7xl">Club shop.</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/76">
            Official kits, training apparel, and supporter wear will be available here. Contact the club for kit enquiries in the meantime.
          </p>
        </div>
      </section>
      <section className="section-band bg-white">
        <div className="container-wide max-w-3xl">
          <div className="card-plain p-8">
            <ShoppingBag aria-hidden="true" className="mb-5 h-8 w-8 text-astra-red" />
            <h2 className="text-2xl font-black text-astra-ink">Shop opening soon</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              The club shop will offer official kits, training apparel, supporter wear, and accessories. Get in touch with the club directly for any kit-related enquiries right now.
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
