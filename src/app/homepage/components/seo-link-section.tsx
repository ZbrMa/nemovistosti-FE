import Link from "next/link";

const linkGroups = [
  {
    title: "Byty",
    links: [
      { label: "Ceny bytů na prodej", href: "/prodej/byty" },
      { label: "Ceny bytů k pronájmu", href: "/pronajem/byty" },
      { label: "Vývoj cen bytů", href: "/prodej/byty" },
      { label: "Byty podle měst", href: "/prodej/byty" },
    ],
  },
  {
    title: "Domy",
    links: [
      { label: "Ceny domů na prodej", href: "/prodej/domy" },
      { label: "Vývoj cen domů", href: "/prodej/domy" },
      { label: "Domy podle okresů", href: "/prodej/domy" },
    ],
  },
  {
    title: "Pozemky",
    links: [
      { label: "Ceny pozemků", href: "/prodej/pozemky" },
      { label: "Pozemky podle okresů", href: "/prodej/pozemky" },
      { label: "Vývoj cen pozemků", href: "/prodej/pozemky" },
    ],
  },
  {
    title: "Trh",
    links: [
      { label: "Prodej", href: "/prodej" },
      { label: "Pronájem", href: "/pronajem" },
      { label: "Seznam nabídek", href: "/nabidky" },
      { label: "Návratnost pronájmu", href: "/navratnost-pronajmu" },
      { label: "O projektu", href: "/o-projektu" },
    ],
  },
] as const;

export function SeoLinkSection() {
  return (
    <section className="space-y-4 py-8 sm:pb-12 sm:pt-0 sm:px-16">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Přehledy podle segmentu trhu</h2>
        <p className="text-sm text-muted-foreground">
          Interní rozcestník pro hlavní tržní segmenty a metodiku.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {linkGroups.map((group) => (
          <div key={group.title} className="rounded-lg border bg-card p-5">
            <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
