export function MarketMethodology() {
  const items = [
    "Data pochází z monitorovaných realitních portálů.",
    "Ceny vychází z aktuálních aktivních nabídek.",
    "Hodnoty se průběžně aktualizují.",
    "Zlevnění je detekováno na základě historie inzerátu.",
    "Přehled je určen pro analytické účely.",
  ];

  return (
    <section className="px-5 py-8 sm:px-16 sm:py-10">
      <h2 className="text-xl font-semibold tracking-tight">O projektu</h2>
      <div className="mt-4 max-w-3xl space-y-2 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
