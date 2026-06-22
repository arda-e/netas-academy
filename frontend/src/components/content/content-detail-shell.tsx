import type { ReactNode } from "react";

import {
  SiteBreadcrumbs,
  type BreadcrumbItem,
} from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";
import { join } from "@/lib/testids";

type ContentDetailShellProps = {
  hero: {
    breadcrumbItems?: BreadcrumbItem[];
    leadMedia?: ReactNode;
    title: string;
    summary?: string;
    titleClassName?: string;
    headerMeta?: ReactNode;
    headerClassName?: string;
  };
  content?: {
    meta?: ReactNode;
  };
  children?: ReactNode;
  slots?: {
    afterContent?: ReactNode;
    skeleton?: ReactNode;
  };
  testId?: string;
};

export function ContentDetailShell({
  hero,
  content,
  children,
  slots,
  testId,
}: ContentDetailShellProps) {
  const breadcrumbs = hero.breadcrumbItems ?? [{ label: hero.title }];

  const hasLeadMedia = Boolean(hero.leadMedia);
  const hasBody = Boolean(children);
  const hasSkeleton = Boolean(slots?.skeleton);

  const bodyContent = hasBody && (
    <div
      className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-7 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 sm:leading-8"
      data-testid={testId && join(testId, "body")}
    >
      {children}
    </div>
  );

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid={testId}>
      <article className="page-section pt-8 sm:pt-10 lg:pt-12">
        <SiteBreadcrumbs
          items={breadcrumbs}
          variant="dark"
          className="mb-5 sm:mb-6"
        />

        <header
          className={cn(
            hero.headerClassName,
            hasLeadMedia &&
              "flex flex-col gap-5 sm:gap-8 md:flex-row md:items-start md:gap-10",
          )}
        >
          {hero.leadMedia && (
            <div
              className="shrink-0"
              data-testid={testId && join(testId, "lead-media")}
            >
              {hero.leadMedia}
            </div>
          )}

          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <h1
              className={cn(
                "text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-6xl",
                hero.titleClassName,
              )}
              data-testid={testId && join(testId, "title")}
            >
              {hero.title}
            </h1>

            {hero.summary && (
              <p
                className="max-w-2xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8"
                data-testid={testId && join(testId, "summary")}
              >
                {hero.summary}
              </p>
            )}

            {hero.headerMeta && (
              <div
                className="space-y-4 pt-2 text-sm text-foreground/72 sm:text-base"
                data-testid={testId && join(testId, "header-meta")}
              >
                {hero.headerMeta}
              </div>
            )}
          </div>
        </header>

        <section className="panel-surface mt-8 w-full rounded-sm p-5 sm:mt-10 sm:p-8 md:p-10">
          {content?.meta && (
            <div
              className="mb-6 space-y-2 border-b border-white/8 pb-6 text-sm text-foreground/68 sm:mb-8 sm:pb-8 sm:text-base"
              data-testid={testId && join(testId, "meta")}
            >
              {content.meta}
            </div>
          )}

          {hasSkeleton ? slots?.skeleton : bodyContent}

          {slots?.afterContent && (
            <div data-testid={testId && join(testId, "after-content")}>
              {slots.afterContent}
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
