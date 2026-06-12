import { Facebook, Instagram, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";

type Social = { label: string; handle: string; href: string };
type Props = {
  email: string;
  phone?: string;
  welfare?: string;
  socials: Social[];
  address: string;
  mapEmbed: string;
};

const icons: Record<string, typeof Instagram> = { Instagram, Facebook };

export function ContactBlock({ email, phone, welfare, socials, address, mapEmbed }: Props) {
  return (
    <div className="container-wide grid gap-8 lg:grid-cols-2">
      <div className="card-dark p-7 sm:p-8">
        <h2 className="crest-type text-2xl text-white">Direct contact</h2>
        <ul className="mt-6 grid gap-4 text-sm text-white/80">
          <li>
            <a href={`mailto:${email}`} className="flex items-center gap-3 transition hover:text-white">
              <Mail aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" /> {email}
            </a>
          </li>
          {phone ? (
            <li className="flex items-center gap-3">
              <Phone aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" /> {phone}
            </li>
          ) : null}
          {welfare ? (
            <li className="flex items-center gap-3">
              <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-astra-red" /> {welfare}
            </li>
          ) : null}
          <li className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-astra-red" /> {address}
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {socials.map((s) => {
            const Icon = icons[s.label];
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
              >
                {Icon ? <Icon aria-hidden="true" className="h-4 w-4 text-astra-gold" /> : <span className="font-black text-astra-gold">X</span>}
                {s.handle}
              </a>
            );
          })}
        </div>
      </div>
      <div className="card-dark overflow-hidden">
        <iframe
          title="Astra United home ground map - Darebin International Sports Centre"
          src={mapEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full min-h-[320px] w-full border-0"
        />
      </div>
    </div>
  );
}
