import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeroOverlayProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  primaryCta?: {
    href: string;
    label: string;
  };
  secondaryCta?: {
    href: string;
    label: string;
  };
};

export function HeroOverlay({
  eyebrow,
  title,
  description,
  imageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  primaryCta,
  secondaryCta,
}: HeroOverlayProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#009ca6_0%,#0f4c81_100%)]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,156,166,0.24)_0%,rgba(15,76,129,0.72)_52%,rgba(8,27,56,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,156,166,0.24),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_26%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-7xl items-center px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="max-w-3xl space-y-4 rounded-sm border border-white/60 bg-white/82 px-8 py-10 text-left text-slate-950 shadow-sm backdrop-blur-md md:px-12 md:py-14">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-slate-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
              {description}
            </p>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row">
              {primaryCta ? (
                <Button asChild size="lg" className="rounded-sm px-6 text-base">
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              ) : null}

              {secondaryCta ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-sm border-slate-300/80 bg-white px-6 text-base text-slate-950 hover:bg-slate-100 hover:text-slate-950"
                >
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
