import Link from "next/link";
import {
  Building2,
  Calculator,
  Home,
  House,
  KeyRound,
  List,
  Store,
} from "lucide-react";

const propertyTypes = [
  {
    title: "Nabídky",
    description: "Kompletní tabulka aktuálních nabídek s filtrováním a exportem.",
    href: "/nabidky",
    icon: List,
  },
  {
    title: "Návratnost pronájmu",
    description: "Porovnání výnosnosti a návratnosti podle lokality a dispozice.",
    href: "/kalkulacky",
    icon: Calculator,
  },
  {
    title: "Prodej bytů",
    description: "Aktuální ceny, aktivita trhu a regionální srovnání bytů na prodej.",
    href: "/prodej/byty",
    icon: Building2,
  },
  {
    title: "Prodej domů",
    description: "Tržní přehled rodinných domů na prodej podle krajů a okresů.",
    href: "/prodej/domy",
    icon: House,
  },
  {
    title: "Prodej komerčních",
    description: "Přehled komerčních nemovitostí na prodej v agregované podobě.",
    href: "/prodej/komercni",
    icon: Store,
  },
  {
    title: "Pronájem bytů",
    description: "Vývoj nájemního trhu bytů podle dispozic, krajů a okresů.",
    href: "/pronajem/byty",
    icon: KeyRound,
  },
  {
    title: "Pronájem komerčních",
    description: "Aktuální přehled komerčních nemovitostí k pronájmu.",
    href: "/pronajem/komercni",
    icon: Home,
  },
] as const;

export function PropertyTypeSection() {
  return (
    <section className="pb-8 sm:pb-12">
      <div className="mb-8 max-w-2xl px-5 sm:px-8">
        <h2 className="text-xl font-bold tracking-tight">Rozcestník</h2>
        <p className="mt-1 text-muted-foreground">
          Přímé vstupy do hlavních analytických pohledů a tabulek.
        </p>
      </div>
      <div className="grid w-full sm:grid-cols-2 lg:grid-cols-4 border-y border-dashed">
        {propertyTypes.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group min-h-52 border-r border-dashed p-5 transition-colors hover:bg-accent/35
[&:nth-child(-n+6)]:border-b
sm:p-8
sm:[&:nth-child(2n)]:border-r-0
lg:p-10
lg:[&:nth-child(2n)]:border-r
lg:[&:nth-child(4n)]:border-r-0
lg:[&:nth-child(n+5)]:border-b-0"
            >
              <div className="mb-5 flex size-10 items-center justify-center rounded-md border bg-background text-primary-600 transition-colors group-hover:border-primary-500 group-hover:bg-primary-50">
                <Icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
