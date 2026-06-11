import { Reveal } from "@/src/components/Reveal";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  copy,
  align = "left",
  inverse = false
}: SectionHeaderProps) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`mb-3 text-sm font-black uppercase tracking-normal ${inverse ? "text-astra-gold" : "text-astra-red"}`}>
        {eyebrow}
      </p>
      <h2 className={`crest-type text-4xl leading-[0.95] sm:text-5xl ${inverse ? "text-white" : "text-astra-ink"}`}>
        {title}
      </h2>
      {copy ? (
        <p className={`mt-5 text-base leading-7 sm:text-lg ${inverse ? "text-white/72" : "text-slate-700"}`}>
          {copy}
        </p>
      ) : null}
    </Reveal>
  );
}
