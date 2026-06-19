import type { ReactNode } from "react";

import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

type MetricButtonCarouselProps = {
  children: ReactNode;
  className?: string;
};

export function MetricButtonCarousel({
  children,
  className,
}: MetricButtonCarouselProps) {
  return (
    <div className={cn("w-full lg:w-auto", className)}>
      <div className="-mx-5 overflow-hidden px-5 sm:-mx-16 sm:px-16 lg:mx-0 lg:overflow-visible lg:px-0">
        <div className="overflow-x-auto scroll-smooth py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible">
          <ButtonGroup className="mb-4 flex-nowrap snap-x snap-mandatory [&>*]:snap-start">
            {children}
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
}
