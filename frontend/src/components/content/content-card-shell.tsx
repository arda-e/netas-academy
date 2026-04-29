import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSuperheading } from "@/components/content/content-superheading";
import { cn } from "@/lib/utils";

type ContentCardShellProps = {
  href?: string;
  title: string;
  kicker?: string;
  headerAddon?: ReactNode;
  summary?: ReactNode;
  meta?: ReactNode;
  className?: string;
  imageUrl?: string | null;
  imageAlt?: string;
};

export function ContentCardShell({
  href,
  title,
  kicker,
  headerAddon,
  summary,
  meta,
  className,
  imageUrl,
  imageAlt,
}: ContentCardShellProps) {
  const hasImage = Boolean(imageUrl);

  const card = (
    <Card
      className={cn(
        "h-full rounded-sm bg-slate-100 py-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group-hover/card-link:border-[#009ca6] sm:pb-6",
        hasImage ? "gap-0 pt-0" : "gap-5 sm:gap-6",
        className
      )}
    >
      {hasImage ? (
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-t-sm">
          <Image
            src={imageUrl!}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <CardHeader
        className={cn(
          "flex flex-row items-start justify-between gap-4 px-5 sm:px-6",
          kicker || headerAddon ? "pb-0" : undefined,
          hasImage ? "pt-6" : undefined
        )}
      >
        <div className="min-w-0 space-y-1.5">
          {kicker ? (
            <ContentSuperheading className="group-hover/card-link:text-[#009ca6]">
              {kicker}
            </ContentSuperheading>
          ) : null}
          <CardTitle className="text-xl leading-6 text-foreground transition-colors group-hover/card-link:text-[#009ca6] sm:text-2xl sm:leading-tight">
            <span>{title}</span>
          </CardTitle>
        </div>
        {headerAddon ? <div className="shrink-0 pt-1">{headerAddon}</div> : null}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5 px-5 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {summary ? (
            typeof summary === "string" ? (
              <p className="text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
                {summary}
              </p>
            ) : (
              summary
            )
          ) : null}
        </div>
        {meta ? <div className="space-y-1 text-sm text-foreground/62">{meta}</div> : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="group/card-link block h-full cursor-pointer">
      {card}
    </Link>
  );
}
