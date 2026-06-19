import type { Metadata } from "next";

import { MethodologyNav } from "@/components/methodology/methodology-nav";
import { MethodologySection } from "@/components/methodology/methodology-section";
import { buildAboutPageSchema, buildPageMetadata } from "@/lib/seo";

const ABOUT_TITLE = "O projektu";
const ABOUT_DESCRIPTION =
  "Jak získávám a zpracovávám data o českém realitním trhu. Popis výpočtů, sledování cen, aktivních nabídek, ceny za m² a návratnosti pronájmu.";

export const metadata: Metadata = buildPageMetadata({
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  path: "/o-projektu",
});

const sections = [
  { id: "o-projektu", label: "O projektu" },
  { id: "jak-data-ziskavame", label: "Jak data získávám" },
  { id: "sledovani-cen", label: "Jak funguje sledování cen" },
  { id: "aktivni-neaktivni", label: "Aktivní a neaktivní nabídky" },
  { id: "cena-za-m2", label: "Jak počítám cenu za m²" },
  {
    id: "navratnost-pronajmu",
    label: "Jak počítám návratnost pronájmu",
  },
  {
    id: "regiony-okresy-mesta",
    label: "Regiony, okresy a města",
  },
  { id: "omezeni-dat", label: "Omezení dat" },
  { id: "aktualizace-dat", label: "Aktualizace dat" },
] as const;

export default function MetodikaPage() {
  const aboutPageSchema = buildAboutPageSchema({
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    path: "/o-projektu",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <div className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <MethodologyNav items={sections} />

            <div className="min-w-0">
              <div className="border-b border-dashed py-6 lg:py-10 px-4 lg:px-8">
                <div className="max-w-3xl space-y-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    O projektu
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Jak vznikají data a metriky realitního trhu v Česku
                  </h1>
                  <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                    Tato stránka popisuje, co v projektu sleduji, jak pracuji s
                    historií inzerátů a jak interpretuji vývoj cen nemovitostí,
                    nájemní trh, aktivní nabídky a zlevnění nemovitostí. Cílem je
                    nabídnout transparentní metodiku analytického webu, nikoli
                    prezentaci jednotlivých nabídek. Jde o můj hobby projekt,
                    který vzniká hlavně z vlastní zvědavosti nad tím, jak se
                    český realitní trh v čase skutečně mění.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden">
                <MethodologySection id="o-projektu" title="O projektu">
                <p>
                  Projekt je zaměřený na realitní trh v Česku a na agregované
                  statistiky, které pomáhají sledovat ceny bytů, ceny domů,
                  cenové změny a aktivitu trhu v čase. Nejde o realitní inzertní
                  portál a není postavený kolem prezentace jednotlivých
                  inzerátů.
                </p>
                <p>
                  Web vzniká jako osobní hobby projekt a datový experiment,
                  který dělám z vlastní zvědavosti. Výstupy proto beru jako
                  analytickou pomůcku pro orientaci v trhu, ne jako oficiální
                  statistiku nebo investiční doporučení.
                </p>
                <p>
                  Hlavním cílem je nabídnout důvěryhodný přehled o tom, jak se
                  vyvíjí nabídka a jak se mění nabídkové ceny v různých částech
                  trhu. Vedle samotných cen sleduji také nájmy, cenu za m²,
                  aktivní nabídky, zlevnění nemovitostí a orientační návratnost
                  pronájmu.
                </p>
                </MethodologySection>

              <MethodologySection
                id="jak-data-ziskavame"
                title="Jak data získávám"
              >
                <p>
                  Data pocházejí z veřejně dostupných realitních nabídek, které
                  pravidelně automatizovaně zpracovávám. Zaznamenávám zejména
                  textové a strukturované informace, které jsou potřeba pro
                  analytické vyhodnocení nabídky, cen a lokality.
                </p>
                <p>
                  Při zpracování sjednocuji názvy lokalit, typy transakcí,
                  kategorie nemovitostí a další atributy tak, aby šlo data
                  porovnávat mezi regiony a v čase. Výsledkem nejsou redakčně
                  upravené profily inzerátů, ale datová vrstva určená pro
                  statistické a metodické vyhodnocení.
                </p>
              </MethodologySection>

              <MethodologySection
                id="sledovani-cen"
                title="Jak funguje sledování cen"
              >
                <p>
                  U každé nabídky sleduji její stav v čase. Pokud se u stejného
                  inzerátu změní nabídková cena, uloží se nová hodnota do
                  historie a je možné porovnat předchozí a aktuální stav. Díky
                  tomu lze sledovat nejen aktuální ceny bytů a ceny domů, ale
                  také jejich vývoj v průběhu jednotlivých týdnů a měsíců.
                </p>
                <p>
                  Historie nabídek je důležitá i pro detekci změn, jako je
                  opakované zlevnění nemovitostí nebo dlouhodobě stagnující
                  cena. Pokud se nabídka znovu objeví v upravené podobě, systém
                  se ji snaží přiřadit k existující historii podle dostupných
                  identifikátorů a dalších shodných znaků.
                </p>
              </MethodologySection>

              <MethodologySection
                id="aktivni-neaktivni"
                title="Aktivní a neaktivní nabídky"
              >
                <p>
                  Za aktivní nabídky považuji inzeráty, které jsou v aktuálním
                  sběru stále dostupné a nevykazují známky ukončení. Pokud
                  nabídka přestane být ve zdrojích dostupná, může být po určitém
                  ověření označena jako neaktivní, stažená nebo ukončená.
                </p>
                <p>
                  Počet aktivních nabídek proto nevyjadřuje celý objem trhu, ale
                  pouze viditelnou část nabídky, kterou lze v daný okamžik
                  zachytit z veřejných zdrojů. U krátkodobě publikovaných
                  inzerátů může být životní cyklus nabídky kratší, než dovolí
                  frekvence sběru bezpečně zaznamenat.
                </p>
              </MethodologySection>

              <MethodologySection
                id="cena-za-m2"
                title="Jak počítám cenu za m²"
              >
                <p>Metrika cena za m² vychází z jednoduchého vzorce:</p>
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-sm text-foreground">
                  cena za m² = nabídková cena / užitná plocha
                </pre>
                <p>
                  Do výpočtu vstupují pouze nabídky, u kterých je dostupná
                  nabídková cena i užitná plocha. Pokud plocha chybí, je zjevně
                  nesprávná nebo neodpovídá povaze nabídky, položka se do této
                  metriky nezařazuje. Agregované hodnoty pak pomáhají porovnávat
                  vývoj cen nemovitostí napříč lokalitami a segmenty trhu.
                </p>
              </MethodologySection>

              <MethodologySection
                id="navratnost-pronajmu"
                title="Jak počítám návratnost pronájmu"
              >
                <p>
                  Orientační hrubou návratnost pronájmu vyjadřuji počtem let,
                  za které by se kupní cena vrátila při daném ročním nájemném:
                </p>
                <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-sm text-foreground">
                  návratnost v letech = kupní cena / roční nájemné
                </pre>
                <p>
                  Jde o zjednodušený ukazatel pro základní srovnání kupního a
                  nájemního trhu. Výpočet nezohledňuje hypotéku, daně, pojištění,
                  opravy, správu, neobsazenost ani další náklady spojené s
                  držením a provozem nemovitosti. Výsledek proto chápu jako
                  orientační hrubou návratnost, nikoli jako investiční
                  doporučení.
                </p>
              </MethodologySection>

              <MethodologySection
                id="regiony-okresy-mesta"
                title="Regiony, okresy a města"
              >
                <p>
                  Data se přiřazují k územním celkům podle dostupných údajů v
                  nabídce a následné normalizace lokalit. Výstupy proto mohou
                  být agregované na úrovni regionů, okresů a měst, pokud je
                  možné nabídku k danému území spolehlivě přiřadit.
                </p>
                <p>
                  U některých inzerátů bývá lokalita uvedena nepřesně, pouze
                  marketingově nebo v jiné územní logice než v oficiálním
                  členění. V takových případech může dojít k nezařazení nabídky
                  do jemnější geografické úrovně, aby zůstala zachována kvalita
                  agregovaných statistik pro realitní trh v Česku.
                </p>
              </MethodologySection>

              <MethodologySection id="omezeni-dat" title="Omezení dat">
                <p>
                  Pracuji s nabídkovými daty, nikoli s realizovanými prodejními
                  cenami. Nabídková cena se může od skutečné uzavřené transakce
                  lišit, a to někdy významně. Statistiky proto slouží hlavně pro
                  sledování směru trhu, relativních rozdílů mezi lokalitami a
                  změn v nabídce.
                </p>
                <p>
                  Omezením je také různá kvalita zdrojových inzerátů. Některé
                  nabídky mohou mít neúplné parametry, nekonzistentní plochy,
                  chybějící dispozici nebo nepřesně uvedenou lokalitu. U menších
                  segmentů trhu navíc může nízký počet záznamů vést k vyšší
                  volatilitě výsledných ukazatelů.
                </p>
                <p>
                  Část nabídek může být v datech duplicitní, protože stejná
                  nemovitost mohla být inzerována vícekrát, například pokaždé v
                  jiné kategorii nebo s upravenými parametry. I když se systém
                  snaží historii nabídek spojovat podle dostupných znaků, není
                  možné duplicity odstranit dokonale. Celková čísla je proto
                  potřeba brát s rezervou a vnímat je hlavně jako orientační
                  obraz veřejně dostupné nabídky.
                </p>
              </MethodologySection>

              <MethodologySection
                id="aktualizace-dat"
                title="Aktualizace dat"
              >
                <p>
                  Sběr a zpracování dat probíhá pravidelně v automatizovaných
                  dávkách. Cílem je průběžně aktualizovat informace o cenách,
                  nájmech, aktivitě nabídky i historii změn tak, aby stránka
                  zachycovala aktuální situaci na trhu bez ručního přepisování
                  jednotlivých inzerátů.
                </p>
                <p>
                  Přesná rychlost promítnutí změn se může lišit podle
                  dostupnosti zdroje, kvality vstupních dat a navazujícího
                  validačního procesu. Uživatel by proto měl některé čerstvé
                  změny chápat jako průběžně potvrzované, zejména pokud jde o
                  krátkodobé výkyvy nebo nově zveřejněné nabídky.
                </p>
              </MethodologySection>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
