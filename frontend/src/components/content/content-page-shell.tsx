import type { ReactNode } from "react";

import { SiteBreadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import {
  HeroGradientBackground,
  type HeroGradientVariant,
} from "@/components/hero-gradient-background";
import { join } from "@/lib/testids";
import { cn } from "@/lib/utils";

type ContentPageShellProps = {
  hero: {
    breadcrumbItems?: BreadcrumbItem[];
    title: string;
    description?: ReactNode;
    descriptionClassName?: string;
    descriptionTrailing?: ReactNode;
    gradientVariant?: HeroGradientVariant;
  };
  children?: ReactNode;
  slots?: {
    skeleton?: ReactNode;
  };
  testId?: string;
};

export function ContentPageShell({
  hero,
  children,
  slots,
  testId,
}: ContentPageShellProps) {
  const resolvedBreadcrumbItems = hero.breadcrumbItems ?? [{ label: hero.title }];

  const renderDescription = () => {
    if (!hero.description) {
      return null;
    }

    const baseDescriptionClass = cn(
      "max-w-2xl space-y-3 text-[15px] leading-7 text-white/88 sm:space-y-4 sm:text-lg sm:leading-8",
      hero.descriptionClassName,
    );

    if (hero.descriptionTrailing) {
      return (
        <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div
            className={baseDescriptionClass}
            data-testid={testId && join(testId, "description")}
          >
            {hero.description}
          </div>
          <div
            className="flex shrink-0 justify-end lg:pb-1"
            data-testid={testId && join(testId, "description-trailing")}
          >
            {hero.descriptionTrailing}
          </div>
        </div>
      );
    }

    return (
      <div
        className={baseDescriptionClass}
        data-testid={testId && join(testId, "description")}
      >
        {hero.description}
      </div>
    );
  };

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid={testId}>
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-slate-950">
        <HeroGradientBackground
          variant={hero.gradientVariant}
          testId={testId && join(testId, "hero-gradient")}
        />
        <div className="page-container relative flex min-h-[280px] items-end py-8 sm:min-h-[340px] sm:py-12 lg:min-h-[400px]">
          <div className="absolute left-4 right-4 top-8 sm:left-6 sm:right-6 sm:top-12 lg:left-10 lg:right-10 xl:left-12 xl:right-12">
            <SiteBreadcrumbs items={resolvedBreadcrumbItems} />
          </div>

          <div
            className={cn(
              "space-y-3 sm:space-y-4",
              hero.descriptionTrailing ? "w-full" : "max-w-3xl",
            )}
          >
            <h1
              className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl"
              data-testid={testId && join(testId, "title")}
            >
              {hero.title}
            </h1>
            {renderDescription()}
          </div>
        </div>
      </section>
      <section className="page-section pt-4 sm:pt-8 lg:pt-8">
        <div data-testid={testId && join(testId, "content")}>
          {slots?.skeleton ?? children}
        </div>
      </section>
    </main>
  );
}
