import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSuperheading } from "@/components/content/content-superheading";
import { cn } from "@/lib/utils";

type ContentCardShellProps = {
  href?: string;
  title: string;
  kicker?: string;
  summary?: string;
  meta?: ReactNode;
  className?: string;
};

export function ContentCardShell({
  href,
  title,
  kicker,
  summary,
  meta,
  className,
}: ContentCardShellProps) {
  const card = (
    <Card
      className={cn(
        "h-full gap-5 rounded-sm bg-slate-100 py-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group-hover/card-link:border-[#009ca6] sm:gap-6 sm:py-6",
        className
      )}
    >
      <CardHeader className={cn("space-y-0 px-5 sm:px-6", kicker ? "pb-0" : undefined)}>
        {kicker ? (
          <ContentSuperheading className="group-hover/card-link:text-[#009ca6]">
            {kicker}
          </ContentSuperheading>
        ) : null}
        <CardTitle className="text-xl leading-6 text-foreground transition-colors group-hover/card-link:text-[#009ca6] sm:text-2xl sm:leading-tight">
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-5 sm:space-y-4 sm:px-6">
        {summary ? (
          <p className="text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">{summary}</p>
        ) : null}
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
