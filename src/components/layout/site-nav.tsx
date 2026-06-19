"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE_NAME } from "@/lib/seo";
import { cn } from "@/lib/utils";

const marketItems = [
  { label: "Prodej", href: "/prodej" },
  { label: "Pronájem", href: "/pronajem" },
] as const;

const navItems = [
  { label: "Seznam nabídek", href: "/nabidky" },
  { label: "Návratnost pronájmu", href: "/navratnost-pronajmu" },
  { label: "O projektu", href: "/o-projektu" },
] as const;

const mobileNavItems = [...marketItems, ...navItems] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMarketActive = marketItems.some((item) =>
    isActivePath(pathname, item.href),
  );

  return (
    <>
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

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              className="lg:hidden"
              aria-label="Otevřít navigaci"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="max-w-none gap-0 bg-background p-0"
        >
          <SheetHeader className="min-h-[52.8px] flex-row items-center justify-between border-b px-5 py-2">
            <SheetTitle className="sr-only">Navigace</SheetTitle>
            <Link
              href="/"
              className="flex items-center gap-2 font-medium text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image src="/favicon.ico" alt="Favicon" width={24} height={24} />
              <span className="whitespace-nowrap">{SITE_NAME}</span>
            </Link>
            <SheetClose
              className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }))}
              aria-label="Zavřít navigaci"
            >
              <X className="size-5" />
            </SheetClose>
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-4 py-5">
            {mobileNavItems.map((item) => {
              const isActive = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-md px-3 text-lg font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    isActive && "bg-accent font-semibold text-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
