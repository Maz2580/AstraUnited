import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { clubContact, navItems, socialLinks } from "@/src/lib/site-data";

const socialIcons: Record<string, typeof Instagram> = {
  Instagram,
  Facebook
};

export function SiteFooter() {
  return (
    <footer className="bg-astra-ink px-5 py-14 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Image
            src="/images/astra-logo.png"
            alt="Astra United Football Club crest"
            width={110}
            height={110}
            className="mb-5 h-24 w-24 object-contain"
          />
          <p className="max-w-md text-sm leading-6 text-white/72">
            A community football club and player development pathway based at Darebin International Sports Centre in Melbourne's north.
          </p>
        </div>
        <div>
          <h2 className="crest-type mb-4 text-lg">Explore</h2>
          <ul className="grid gap-2 text-sm text-white/72">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link className="transition hover:text-white" href="/shop">
                Future Shop
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="crest-type mb-4 text-lg">Home Ground</h2>
          <p className="flex gap-3 text-sm leading-6 text-white/72">
            <MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-astra-red" />
            <span>{clubContact.ground}, {clubContact.address}</span>
          </p>
          <a
            href={`mailto:${clubContact.email}`}
            className="mt-4 flex items-center gap-3 text-sm text-white/72 transition hover:text-white"
          >
            <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" />
            {clubContact.email}
          </a>
        </div>
        <div>
          <h2 className="crest-type mb-4 text-lg">Connect</h2>
          <ul className="grid gap-2 text-sm text-white/72">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.label];
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 transition hover:text-white"
                  >
                    {Icon ? (
                      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-gold" />
                    ) : (
                      <span aria-hidden="true" className="inline-block h-5 w-5 shrink-0 text-center font-black text-astra-gold">
                        X
                      </span>
                    )}
                    {social.handle}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/48 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Copyright &copy; {new Date().getFullYear()} Astra United Football Club | All Rights Reserved. | Designed by Sash Digital Agency
        </p>
        <p>Football for all, played the Astra way.</p>
      </div>
    </footer>
  );
}
