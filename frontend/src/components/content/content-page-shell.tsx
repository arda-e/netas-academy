import type { ReactNode } from "react";

import {
  SiteBreadcrumbs,
  type BreadcrumbItem,
} from "@/components/breadcrumbs";

type ContentPageShellProps = {
  breadcrumbItems?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  descriptionClassName?: string;
  descriptionTrailing?: ReactNode;
  children: ReactNode;
};

export function ContentPageShell({
  breadcrumbItems,
  eyebrow,
  title,
  description,
  descriptionClassName,
  descriptionTrailing,
  children,
}: ContentPageShellProps) {
  const resolvedBreadcrumbItems = breadcrumbItems ?? [
    { label: eyebrow ?? title },
  ];

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#009ca6_0%,#0f4c81_100%)]">
        <div className="page-container relative flex min-h-[280px] items-end py-8 sm:min-h-[340px] sm:py-12 lg:min-h-[400px]">
          <div className="absolute left-4 right-4 top-8 sm:left-6 sm:right-6 sm:top-12 lg:left-10 lg:right-10 xl:left-12 xl:right-12">
            <SiteBreadcrumbs items={resolvedBreadcrumbItems} />
          </div>
          <div
            className={[
              "space-y-3 sm:space-y-4",
              descriptionTrailing ? "w-full" : "max-w-3xl",
            ].join(" ")}
          >
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/82">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl">
              {title}
            </h1>
            {description ? (
              descriptionTrailing ? (
                <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
                  <div
                    className={[
                      "max-w-3xl space-y-3 text-[15px] leading-7 text-white/76 sm:space-y-4 sm:text-lg sm:leading-8",
                      descriptionClassName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {description}
                  </div>
                  <div className="flex shrink-0 justify-end lg:pb-1">
                    {descriptionTrailing}
                  </div>
                </div>
              ) : (
                <div
                  className={[
                    "max-w-2xl space-y-3 text-[15px] leading-7 text-white/76 sm:space-y-4 sm:text-lg sm:leading-8",
                    descriptionClassName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {description}
                </div>
              )
            ) : null}
          </div>
        </div>
      </section>

      <section className="page-section pt-4 sm:pt-8 lg:pt-8">
        <div>{children}</div>
      </section>
    </main>
  );
}
