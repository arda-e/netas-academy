"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { join } from "@/lib/testids";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type SiteBreadcrumbsProps = {
  items?: BreadcrumbItem[];
  variant?: "light" | "dark";
  className?: string;
};

function getRouteKey(href: string): string {
  const key = href.replace(/^\//, "").replace(/\//g, "-");
  return key || "ana-sayfa";
}

export function SiteBreadcrumbs({
  items = [],
  variant = "light",
  className,
}: SiteBreadcrumbsProps) {
  const t = useTranslations('common');
  const allItems: BreadcrumbItem[] = [{ label: "Ana Sayfa", href: "/" }, ...items];
  const lastIndex = allItems.length - 1;

  return (
    <nav
      aria-label={t('breadcrumbs.aria_label')}
      data-testid="breadcrumbs.nav"
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.22em]",
        variant === "light" ? "text-white/58" : "text-foreground/52",
        className
      )}
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        {allItems.map((item, index) => {
          const isCurrent = index === lastIndex;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 max-w-full items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="opacity-[0.46]">
                  /
                </span>
              ) : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  data-testid={join("breadcrumbs", "link", getRouteKey(item.href))}
                  className={cn(
                    "transition-colors",
                    variant === "light"
                      ? "hover:text-white"
                      : "hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  data-testid="breadcrumbs.current"
                  className={cn(
                    "block max-w-[min(68vw,32rem)] truncate",
                    isCurrent
                      ? variant === "light"
                        ? "text-white/86"
                        : "text-foreground/78"
                      : undefined
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
