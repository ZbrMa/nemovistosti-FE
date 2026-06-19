import Link from "next/link";
import Image from "next/image";

import { SiteNav } from "@/components/layout/site-nav";
import { SITE_NAME } from "@/lib/seo";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex lg:min-h-14 w-full max-w-[1300px] items-center gap-4 px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
          <Image src="/favicon.ico" alt="Favicon" width={24} height={24} />
          <span className="whitespace-nowrap">{SITE_NAME}</span>
        </Link>

        <div className="ml-auto">
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
