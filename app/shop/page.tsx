import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/src/components/blocks/PageHero";
import { CardsBlock } from "@/src/components/blocks/CardsBlock";

export const metadata: Metadata = {
  title: "Club Shop",
  description: "Official Astra United FC club shop - kits, training apparel, and supporter wear coming soon."
};

const kitCards = [
  { title: "Player bundles", copy: "Everything a new signing needs - home/away jerseys, shorts, and socks." },
  { title: "Training apparel", copy: "Astra-branded quarter-zips, rain jackets, and training tees." },
  { title: "Customisation", copy: "Add your squad number or initials to select items." }
];

const fanCards = [
  { title: "Astra lifestyle", copy: "High-quality hoodies, beanies, and scarves for cold morning kick-offs." },
  { title: "Gifts & accessories", copy: "Branded water bottles, gym bags, and car stickers for the ultimate fan." },
  { title: "Member discounts", copy: "Astra members may be eligible for seasonal discounts on selected items." }
];

export default function ShopPage() {
  return (
    <main id="main-content" className="bg-astra-ink">
      <PageHero
        eyebrow="Coming soon"
        title="Gear up for game day."
        intro="Show your colours with the official Astra United range - professional match-day kits for our players and comfortable sideline wear for our supporters."
        hero={{
          src: "/images/kit/astra-kit-ball-1280.webp",
          alt: "Astra United Academy jersey beside the official match ball at the Darebin ground",
          blurDataURL:
            "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADwAwCdASoQABgAPu1iqk2ppaQiMAgBMB2JYgCdOUAAhXd8KMmZvxcAANc0QbnWA1e8eb71ZbYLPRtgKeFJOG3r962snakr3n7F2TwlfVFXyug2uWIbf+6UsjPW0qj8Ves/Qn88QAA="
        }}
      />
      <section className="section-band band-fog">
        <CardsBlock title="Official match & training kit" intro="Built for the pitch and every session." items={kitCards} />
      </section>
      <section className="section-band band-deep">
        <CardsBlock title="Supporter & fan wear" intro="Represent the club from the sideline." items={fanCards} />
      </section>
      <section className="section-band band-fog">
        <div className="container-wide max-w-3xl">
          <div className="card-dark p-8 text-white">
            <h2 className="crest-type text-2xl">Online store opening soon</h2>
            <p className="mt-4 text-base leading-7 text-white/76">
              The full club shop is on the way. In the meantime, contact the club directly for any kit-related enquiries.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-normal text-astra-red">
              Contact the club
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
