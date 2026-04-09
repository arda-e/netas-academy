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
  eyebrow = "Netas Academy",
  title,
  description,
  imageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
  primaryCta,
  secondaryCta,
}: HeroOverlayProps) {
  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,31,57,0.3)_0%,rgba(14,31,57,0.62)_52%,rgba(10,24,46,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(89,210,220,0.18),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_26%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-7xl items-center px-6 py-16 md:px-10 md:py-20 lg:px-12">
        <div className="max-w-3xl space-y-6 rounded-sm border border-white/60 bg-white/82 px-8 py-10 text-left text-slate-950 shadow-[0_24px_80px_rgba(255,255,255,0.16)] backdrop-blur-md md:px-12 md:py-14">
          <p className="text-sm font-medium uppercase tracking-[0.34em] text-slate-700">
            {eyebrow}
          </p>
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
