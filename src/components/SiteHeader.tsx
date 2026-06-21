import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CtaLink } from "@/src/components/CtaLink";
import { navItems } from "@/src/lib/site-data";
import { NoticeMarqueeServer } from "@/src/components/content/NoticeMarqueeServer";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-astra-ink/88 text-white backdrop-blur-xl">
      <nav className="mx-auto flex min-h-24 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/astra-logo.png"
            alt="Astra United Football Club"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
            priority
          />
          <span className="crest-type hidden text-xl leading-none sm:block">
            Astra <span className="text-astra-red">United</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-underline rounded px-3 py-2 text-sm font-semibold text-white/82 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <CtaLink
          href="/join-us"
          className="px-4 py-2.5 text-sm font-black uppercase tracking-normal shadow-lg shadow-red-950/20"
        >
          Register
          <ArrowRight aria-hidden="true" className="btn-icon h-4 w-4" />
        </CtaLink>
      </nav>
      {/* Admin announcements — gold scrolling band pinned under the nav (t10) */}
      <NoticeMarqueeServer />
    </header>
  );
}
