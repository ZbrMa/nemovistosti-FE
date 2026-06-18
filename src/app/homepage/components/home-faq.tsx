import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Co tento realitní analytický přehled sleduje?",
    answer:
      "Agregované tržní statistiky, cenové trendy, počet nabídek a vývoj vybraných segmentů realitního trhu.",
  },
  {
    question: "Jak často jsou data aktualizována?",
    answer:
      "Datová vrstva je navržená pro denně aktualizovaná data, aby bylo možné sledovat změny trhu s krátkým zpožděním.",
  },
  {
    question: "Jak se počítá cena za m²?",
    answer:
      "Cena za m² vychází z dostupné ceny a plochy nemovitosti. V přehledech se používají agregace jako průměr a medián.",
  },
  {
    question: "K čemu slouží market screener?",
    answer:
      "Market screener pomáhá porovnávat segmenty trhu podle lokality, typu nemovitosti, typu nabídky, počtu nabídek a cen za m².",
  },
] as const;

export function HomeFaq() {
  return (
    <section className="space-y-4 pb-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Časté otázky</h2>
        <p className="text-sm text-muted-foreground">
          Stručné odpovědi k datům a způsobu použití přehledu.
        </p>
      </div>
      <Accordion className="rounded-lg border bg-card px-5 py-2">
        {faqItems.map((item) => (
          <AccordionItem key={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
