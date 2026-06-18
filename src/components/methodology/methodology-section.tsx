import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MethodologySectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export function MethodologySection({
  id,
  title,
  children,
  className,
}: MethodologySectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "scroll-mt-28 border-b border-dashed px-5 py-6 sm:px-8 sm:py-10",
        className
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-8">
        <div>
          <h2
            id={`${id}-title`}
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {title}
          </h2>
        </div>
        <div className="max-w-3xl space-y-4 leading-7 text-foreground">
          {children}
        </div>
      </div>
    </section>
  );
}
