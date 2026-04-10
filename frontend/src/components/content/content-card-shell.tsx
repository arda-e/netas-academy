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
        "h-full rounded-sm bg-slate-100 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group-hover/card-link:border-[#009ca6]",
        className
      )}
    >
      <CardHeader className={cn("space-y-0", kicker ? "pb-0" : undefined)}>
        {kicker ? (
          <ContentSuperheading className="group-hover/card-link:text-[#009ca6]">
            {kicker}
          </ContentSuperheading>
        ) : null}
        <CardTitle className="text-2xl leading-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6]">
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <p className="text-base leading-7 text-foreground/74">{summary}</p>
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
