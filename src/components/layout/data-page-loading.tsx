import { Skeleton } from "@/components/ui/skeleton";

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1300px] px-0 lg:px-8">
      <div className="border-x border-dashed border-border">{children}</div>
    </div>
  );
}

function HeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <section className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between">
      <div className="px-5 py-4 sm:px-16 sm:py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </div>
      {withActions ? (
        <div className="flex w-full flex-col self-stretch sm:w-fit lg:border-l border-dashed">
          <div className="grid grid-cols-2">
            <Skeleton className="h-10 rounded-none" />
            <Skeleton className="h-10 rounded-none" />
          </div>
          <div className="grid grid-cols-3 border-t border-dashed sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 rounded-none" />
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-dashed px-3 py-3">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function KpiGridSkeleton() {
  return (
    <section className="grid gap-px border-y border-dashed bg-border sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-background p-5 sm:p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-8 w-32" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </section>
  );
}

function SectionSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="px-5 py-8 sm:px-16 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="hidden h-8 w-52 sm:block" />
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </section>
  );
}

export function MarketOverviewLoading() {
  return (
    <PageFrame>
      <HeaderSkeleton />
      <KpiGridSkeleton />
      <SectionSkeleton rows={5} />
      <SectionSkeleton rows={8} />
      <SectionSkeleton rows={7} />
    </PageFrame>
  );
}

export function HomePageLoading() {
  return (
    <PageFrame>
      <section className="px-5 py-12 text-center md:py-24">
        <Skeleton className="mx-auto h-9 w-full max-w-xl" />
        <Skeleton className="mx-auto mt-4 h-5 w-full max-w-lg" />
        <div className="mt-6 flex justify-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </section>
      <KpiGridSkeleton />
      <SectionSkeleton rows={5} />
      <SectionSkeleton rows={4} />
    </PageFrame>
  );
}

export function ListingsPageLoading() {
  return (
    <div className="mx-auto flex h-[calc(100svh-72.8px)] w-full max-w-[1500px] px-0 lg:px-8">
      <div className="flex min-h-0 flex-1 flex-col gap-4 border-x border-dashed py-6">
        <div className="flex shrink-0 flex-col gap-3 px-5 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col border-y border-dashed">
          <div className="grid min-w-[980px] grid-cols-11 gap-px bg-border">
            {Array.from({ length: 11 }).map((_, index) => (
              <Skeleton key={index} className="h-10 rounded-none bg-background" />
            ))}
          </div>
          <div className="space-y-px bg-border">
            {Array.from({ length: 12 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid min-w-[980px] grid-cols-11 gap-px">
                {Array.from({ length: 11 }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className="h-9 rounded-none bg-background"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalculatorPageLoading() {
  return (
    <PageFrame>
      <div className="space-y-12 px-5 py-8 sm:px-16 lg:py-12">
        <HeaderSkeleton withActions={false} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
        <SectionSkeleton rows={8} />
        <Skeleton className="h-80 w-full" />
      </div>
    </PageFrame>
  );
}
