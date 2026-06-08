import type { Block } from "@/src/lib/site-data";
import { ProseBlock } from "@/src/components/blocks/ProseBlock";
import { CardsBlock } from "@/src/components/blocks/CardsBlock";
import { TableBlock } from "@/src/components/blocks/TableBlock";
import { StepsBlock } from "@/src/components/blocks/StepsBlock";
import { PillarsBlock } from "@/src/components/blocks/PillarsBlock";
import { ContactBlock } from "@/src/components/blocks/ContactBlock";
import { ContactForm } from "@/src/components/blocks/ContactForm";

function renderBlock(block: Block) {
  switch (block.type) {
    case "prose":
      return <ProseBlock title={block.title} copy={block.copy} bullets={block.bullets} />;
    case "cards":
      return <CardsBlock title={block.title} intro={block.intro} items={block.items} />;
    case "table":
      return <TableBlock title={block.title} intro={block.intro} columns={block.columns} rows={block.rows} />;
    case "steps":
      return <StepsBlock title={block.title} items={block.items} />;
    case "pillars":
      return <PillarsBlock title={block.title} items={block.items} />;
    case "contact":
      return (
        <ContactBlock
          email={block.email}
          phone={block.phone}
          welfare={block.welfare}
          socials={block.socials}
          address={block.address}
          mapEmbed={block.mapEmbed}
        />
      );
    case "form":
      return <ContactForm title={block.title} intro={block.intro} subjects={block.subjects} submitLabel={block.submitLabel} mailto={block.mailto} />;
  }
}

export function BlockRenderer({ block, index }: { block: Block; index: number }) {
  const band = index % 2 === 0 ? "band-fog" : "band-deep";
  return <section className={`section-band ${band}`}>{renderBlock(block)}</section>;
}
