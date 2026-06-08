import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; intro?: string; items: { title: string; copy: string }[] };

export function CardsBlock({ title, intro, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Astra United" title={title} copy={intro} inverse /> : null}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="card-dark p-6">
            <h3 className="text-xl font-black text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/72">{item.copy}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
