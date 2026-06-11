import { PopCard } from "@/src/components/FlowReveal";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; items: { label: string; copy: string }[] };

export function PillarsBlock({ title, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="What we look for" title={title} inverse /> : null}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <PopCard key={item.label} className="card-dark p-5" delay={index * 0.04}>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-astra-red">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
          </PopCard>
        ))}
      </div>
    </div>
  );
}
