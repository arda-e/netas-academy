import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroOverlayVariant = "home" | "feature";

type HeroOverlayProps = {
  variant?: HeroOverlayVariant;
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
  showBreadcrumb?: boolean;
  primaryCtaMeasurementId?: string;
  secondaryCtaMeasurementId?: string;
  primaryCtaTestId?: string;
  secondaryCtaTestId?: string;
};

export function HeroOverlay({
  variant = "feature",
  title,
  description,
  imageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  primaryCta,
  secondaryCta,
  showBreadcrumb = true,
  primaryCtaMeasurementId,
  secondaryCtaMeasurementId,
  primaryCtaTestId,
  secondaryCtaTestId,
}: HeroOverlayProps) {
  if (variant === "home") {
    return (
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-[#009ca6]/82" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,156,166,0.92)_0%,rgba(0,156,166,0.78)_40%,rgba(0,156,166,0.62)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_88%_80%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_20%_84%,rgba(255,255,255,0.06),transparent_20%)]" />

        <div
          className={cn(
            "page-container relative flex min-h-[clamp(780px,100svh,1100px)] w-full items-end py-16 sm:py-20 lg:min-h-[clamp(860px,100svh,1120px)] lg:py-24",
            showBreadcrumb && "pt-24 sm:pt-28 lg:pt-32"
          )}
        >
          {showBreadcrumb && (
            <div className="absolute left-4 right-4 top-10 sm:left-6 sm:right-6 sm:top-14 lg:left-10 lg:right-10 lg:top-16 xl:left-12 xl:right-12">
              <SiteBreadcrumbs items={[]} />
            </div>
          )}

          <div className="grid w-full gap-10 text-left text-white lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)] lg:items-end lg:gap-16">
            <div className="max-w-4xl space-y-4 pb-6">
              <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.94] tracking-normal drop-shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem]">
                {title}
              </h1>
            </div>

            <div className="max-w-xl space-y-8 pb-12 lg:pb-24 lg:pt-14">
              {description && (
                <p className="max-w-[26rem] text-base leading-7 text-white sm:text-lg lg:text-xl lg:leading-8">
                  {description}
                </p>
              )}

              <HeroOverlayActions
                primaryCta={primaryCta}
                secondaryCta={secondaryCta}
                primaryCtaMeasurementId={primaryCtaMeasurementId}
                secondaryCtaMeasurementId={secondaryCtaMeasurementId}
                primaryCtaTestId={primaryCtaTestId}
                secondaryCtaTestId={secondaryCtaTestId}
                variant="home"
              />
            </div>
          </div>

          <div className="absolute bottom-8 left-4 flex items-center gap-3 sm:bottom-10 sm:left-10 lg:left-16">
            <button
              type="button"
              aria-label="Önceki içerik"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/26 text-white backdrop-blur-sm transition-colors hover:bg-white/36"
            >
              <ArrowLeft size={22} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Sonraki içerik"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 transition-colors hover:bg-white/92"
            >
              <ArrowRight size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-18"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.86)_48%,rgba(255,255,255,0.96)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.82)_48%,rgba(2,6,23,0.96)_100%)]" />

      <div className="page-container relative flex min-h-[360px] w-full items-center py-12 sm:py-16 lg:py-20">
        {showBreadcrumb && (
          <div className="absolute left-4 right-4 top-8 sm:left-6 sm:right-6 lg:left-10 lg:right-10 xl:left-12 xl:right-12">
            <SiteBreadcrumbs items={[]} />
          </div>
        )}

        <div className="max-w-3xl space-y-5 text-left">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl page-body-text">{description}</p>
          )}

          <HeroOverlayActions
            primaryCta={primaryCta}
            secondaryCta={secondaryCta}
            primaryCtaMeasurementId={primaryCtaMeasurementId}
            secondaryCtaMeasurementId={secondaryCtaMeasurementId}
            primaryCtaTestId={primaryCtaTestId}
            secondaryCtaTestId={secondaryCtaTestId}
            variant="feature"
          />
        </div>
      </div>
    </section>
  );
}

type HeroOverlayActionsProps = Pick<
  HeroOverlayProps,
  | "primaryCta"
  | "secondaryCta"
  | "primaryCtaMeasurementId"
  | "secondaryCtaMeasurementId"
  | "primaryCtaTestId"
  | "secondaryCtaTestId"
> & {
  variant: HeroOverlayVariant;
};

function HeroOverlayActions({
  primaryCta,
  secondaryCta,
  primaryCtaMeasurementId,
  secondaryCtaMeasurementId,
  primaryCtaTestId,
  secondaryCtaTestId,
  variant,
}: HeroOverlayActionsProps) {
  if (!primaryCta && !secondaryCta) {
    return null;
  }

  const isHome = variant === "home";

  return (
    <div className="flex flex-col items-start gap-3 pt-1 sm:flex-row">
      {primaryCta && (
        <Button
          asChild
          size="lg"
          className={cn(
            "w-full justify-center rounded-full px-12 py-6 text-center text-lg font-medium sm:w-auto",
            isHome &&
              "border-0 bg-white text-slate-800 shadow-[0_18px_36px_rgba(255,255,255,0.2)] hover:bg-white/92"
          )}
        >
          <Link
            href={primaryCta.href}
            data-measurement-id={primaryCtaMeasurementId}
            data-testid={primaryCtaTestId}
          >
            {primaryCta.label}
          </Link>
        </Button>
      )}

      {secondaryCta && (
        <Button
          asChild
          variant="outline"
          size="lg"
          className={cn(
            "w-full justify-center rounded-full px-8 py-6 text-center text-base sm:w-auto",
            isHome &&
              "border-white/18 bg-white/8 text-white backdrop-blur-sm hover:bg-white/14 hover:text-white"
          )}
        >
          <Link
            href={secondaryCta.href}
            data-measurement-id={secondaryCtaMeasurementId}
            data-testid={secondaryCtaTestId}
          >
            {secondaryCta.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
