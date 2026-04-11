import Link from "next/link";

import { Button } from "@/components/ui/button";

type VisualStoryItem = {
  title: string;
  description: string;
  imageUrl: string;
  href?: string;
  ctaLabel?: string;
};

type VisualStorySectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: VisualStoryItem[];
};

export function VisualStorySection({
  eyebrow,
  title,
  description,
  items,
}: VisualStorySectionProps) {
  return (
    <section className="mt-14 space-y-6 sm:mt-16 sm:space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary/76">
          {eyebrow}
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-foreground/72 sm:text-lg sm:leading-8">
          {description}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.title}
            className="panel-surface rounded-sm overflow-hidden"
          >
            <div
              className="h-44 w-full border-b border-white/8 bg-cover bg-center sm:h-56"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
            <div className="space-y-3 p-5 sm:space-y-4 sm:p-6">
              <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {item.title}
              </h3>
              <p className="text-sm leading-6 text-foreground/72 sm:text-base sm:leading-7">
                {item.description}
              </p>
              {item.href && item.ctaLabel ? (
                <Button asChild variant="outline" className="w-full rounded-sm sm:w-auto">
                  <Link href={item.href}>{item.ctaLabel}</Link>
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
