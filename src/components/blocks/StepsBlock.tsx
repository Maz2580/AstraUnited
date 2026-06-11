import { PopCard } from "@/src/components/FlowReveal";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; items: { title: string; copy: string }[] };

export function StepsBlock({ title, items }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Step by step" title={title} inverse /> : null}
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.title}>
            <PopCard className="card-dark h-full p-6" delay={i * 0.05}>
              <span className="crest-type flex h-10 w-10 items-center justify-center rounded-full bg-astra-red text-lg text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
            </PopCard>
          </li>
        ))}
      </ol>
    </div>
  );
}
