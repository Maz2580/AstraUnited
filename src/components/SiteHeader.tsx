import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { navItems } from "@/src/lib/site-data";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-astra-ink/88 text-white backdrop-blur-xl">
      <nav className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/astra-logo.png"
            alt="Astra United Football Club"
            width={58}
            height={58}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="crest-type hidden text-lg leading-none sm:block">
            Astra
            <span className="block text-astra-red">United</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/8 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/join-us"
          className="inline-flex items-center gap-2 rounded bg-astra-red px-4 py-2.5 text-sm font-black uppercase tracking-normal text-white shadow-lg shadow-red-950/20 transition hover:bg-red-700"
        >
          Register
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </nav>
    </header>
  );
}
