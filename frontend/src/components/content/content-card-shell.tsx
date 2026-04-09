import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ContentCardShellProps = {
  href?: string;
  title: string;
  kicker?: string;
  summary?: string;
  meta?: ReactNode;
};

export function ContentCardShell({
  href,
  title,
  kicker,
  summary,
  meta,
}: ContentCardShellProps) {
  return (
    <Card className="h-full rounded-sm bg-card/72 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card/88 hover:shadow-[0_24px_64px_rgba(0,0,0,0.32)]">
      <CardHeader className={cn("space-y-3", kicker ? "pb-0" : undefined)}>
        {kicker ? (
          <p className="text-sm uppercase tracking-[0.24em] text-primary/72">
            {kicker}
          </p>
        ) : null}
        <CardTitle className="text-2xl leading-tight text-foreground">
          {href ? (
            <Link href={href} className="transition-colors hover:text-primary/92">
              {title}
            </Link>
          ) : (
            <span>{title}</span>
          )}
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
}
