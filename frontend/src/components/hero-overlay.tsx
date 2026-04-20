import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeroOverlayProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
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
  imageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  primaryCta,
  secondaryCta,
}: HeroOverlayProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#197f84_0%,#238d91_48%,#2f999d_100%)]">
      <div
        className="absolute inset-0 bg-cover bg-left-center opacity-34"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,110,116,0.92)_0%,rgba(29,137,141,0.84)_42%,rgba(40,152,156,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(255,185,51,0.28),transparent_16%),radial-gradient(circle_at_84%_82%,rgba(255,185,51,0.18),transparent_18%)]" />
      <div className="absolute inset-y-0 left-0 w-[38%] bg-[linear-gradient(90deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.03)_72%,transparent_100%)]" />

      <div className="page-container relative flex min-h-[calc(58vh-81px)] w-full items-center py-10 sm:min-h-[calc(70vh-81px)] sm:py-14 lg:min-h-[calc(74vh-81px)] lg:justify-end lg:py-16">
        <div className="max-w-3xl space-y-5 text-left text-white lg:mr-6">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/74">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[0.94] tracking-tight sm:text-5xl md:text-6xl lg:text-[5.2rem]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-base leading-7 text-white/88 sm:text-lg sm:leading-8 md:text-xl">
              {description}
            </p>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row">
              {primaryCta ? (
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full border-0 bg-[#ffb933] px-7 text-base font-semibold text-slate-950 shadow-[0_18px_36px_rgba(255,185,51,0.34)] hover:bg-[#ffca59] sm:w-auto"
                >
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              ) : null}

              {secondaryCta ? (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-white/36 bg-white/10 px-7 text-base text-white backdrop-blur-sm hover:bg-white/18 hover:text-white sm:w-auto"
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
