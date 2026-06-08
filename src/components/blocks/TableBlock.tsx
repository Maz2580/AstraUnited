import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title?: string; intro?: string; columns: string[]; rows: string[][] };

export function TableBlock({ title, intro, columns, rows }: Props) {
  return (
    <div className="container-wide">
      {title ? <SectionHeader eyebrow="Astra United" title={title} copy={intro} inverse /> : null}
      <div className="card-dark mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/12">
              {columns.map((c) => (
                <th key={c} className="px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-astra-gold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-white/8 last:border-0">
                {row.map((cell, ci) => (
                  <td key={ci} className={`px-5 py-4 align-top leading-6 ${ci === 0 ? "font-black text-white" : "text-white/72"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
