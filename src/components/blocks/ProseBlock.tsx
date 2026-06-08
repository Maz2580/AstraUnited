import { Check } from "lucide-react";

type Props = { title: string; copy: string; bullets?: string[] };

export function ProseBlock({ title, copy, bullets }: Props) {
  return (
    <div className="container-wide grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <h2 className="crest-type text-3xl leading-[0.95] text-white sm:text-4xl">{title}</h2>
      <div>
        <p className="max-w-2xl text-base leading-7 text-white/76 sm:text-lg">{copy}</p>
        {bullets ? (
          <ul className="mt-6 grid gap-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-sm leading-6 text-white/80">
                <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-astra-red" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
