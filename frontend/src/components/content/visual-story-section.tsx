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
    <section className="mt-16 space-y-8">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary/76">
          {eyebrow}
        </p>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-foreground/72">
          {description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.title}
            className="panel-surface rounded-sm overflow-hidden"
          >
            <div
              className="h-56 w-full border-b border-white/8 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
            />
            <div className="space-y-4 p-6">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="text-base leading-7 text-foreground/72">
                {item.description}
              </p>
              {item.href && item.ctaLabel ? (
                <Button asChild variant="outline" className="rounded-sm">
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
