type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="max-w-2xl space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Rozpracovaná sekce</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">{description}</p>
        </section>
      </div>
    </main>
  );
}
