import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
type MethodologyNavItem = {
  id: string;
  label: string;
};

type MethodologyNavProps = {
  items: readonly MethodologyNavItem[];
};

export function MethodologyNav({ items }: MethodologyNavProps) {
  return (
    <aside className="hidden lg:block border-r border-border">
      <div className="sticky top-24 pr-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
          Obsah
        </p>
        <nav aria-label="Obsah metodiky" className="mt-3">
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  className={cn(buttonVariants({ variant: "ghost", size:"sm" }), "justify-start text-muted-foreground hover:text-foreground w-full")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
