import type { ReactNode } from "react";

import {
  SiteBreadcrumbs,
  type BreadcrumbItem,
} from "@/components/breadcrumbs";

type ContentDetailShellProps = {
  breadcrumbItems?: BreadcrumbItem[];
  leadMedia?: ReactNode;
  eyebrow?: string;
  title: string;
  summary?: string;
  meta?: ReactNode;
  children: ReactNode;
  afterContent?: ReactNode;
};

export function ContentDetailShell({
  breadcrumbItems,
  leadMedia,
  eyebrow,
  title,
  summary,
  meta,
  children,
  afterContent,
}: ContentDetailShellProps) {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <article className="page-section pt-8 sm:pt-10 lg:pt-12">
        <SiteBreadcrumbs
          items={breadcrumbItems ?? [{ label: title }]}
          variant="dark"
          className="mb-5 sm:mb-6"
        />
        <div
          className={
            leadMedia
              ? "flex flex-col gap-5 sm:gap-8 md:flex-row md:items-start md:gap-10"
              : ""
          }
        >
          {leadMedia ? <div className="shrink-0">{leadMedia}</div> : null}
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary/76">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-6xl">
              {title}
            </h1>
            {summary ? (
              <p className="max-w-2xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8">
                {summary}
              </p>
            ) : null}
          </div>
        </div>

        <div className="panel-surface mt-8 w-full rounded-sm p-5 sm:mt-10 sm:p-8 md:p-10">
          {meta ? (
            <div className="mb-6 space-y-2 border-b border-white/8 pb-6 text-sm text-foreground/68 sm:mb-8 sm:pb-8 sm:text-base">
              {meta}
            </div>
          ) : null}
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-7 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 sm:leading-8">
            {children}
          </div>
          {afterContent}
        </div>
      </article>
    </main>
  );
}
