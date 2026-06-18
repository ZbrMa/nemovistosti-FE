"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const marketItems = [
  { label: "Prodej", href: "/prodej" },
  { label: "Pronájem", href: "/pronajem" },
] as const;

const navItems = [
  { label: "Seznam nabídek", href: "/nabidky" },
  { label: "Návratnost pronájmu", href: "/kalkulacky" },
  { label: "O projektu", href: "/o-projektu" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const isMarketActive = marketItems.some((item) =>
    isActivePath(pathname, item.href),
  );

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-8">
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "bg-transparent! p-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-primary-600 focus:bg-transparent",
              isMarketActive && "text-primary-600",
            )}
          >
            Trh
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-36 p-1">
            {marketItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <NavigationMenuLink
                  key={item.href}
                  render={<Link href={item.href} />}
                  className={cn(
                    "px-2.5 py-1.5 text-muted-foreground hover:text-foreground focus:text-foreground",
                    isActive && "text-foreground",
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              );
            })}
          </NavigationMenuContent>
        </NavigationMenuItem>

        {navItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                render={
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                  />
                }
                className={cn(
                  "bg-transparent p-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-primary-600 focus:bg-transparent",
                  isActive && "text-primary-600",
                )}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
