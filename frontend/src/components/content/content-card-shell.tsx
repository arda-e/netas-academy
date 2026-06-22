import Image from "next/image";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSuperheading } from "@/components/content/content-superheading";
import { Link } from "@/i18n/navigation";
import { getImagePlaceholderProps, type ImageSource } from "@/lib/image-sources";
import { cn } from "@/lib/utils";
import { join } from "@/lib/testids";

type ContentCardShellProps = {
  href?: string;
  content: {
    title: string;
    kicker?: string;
    summary?: ReactNode;
    meta?: ReactNode;
  };
  media?: {
    imageUrl?: ImageSource | null;
    imageAlt?: string;
    imageSize?: "small" | "medium" | "large";
    blurDataURL?: string;
  };
  slots?: {
    headerAddon?: ReactNode;
    skeleton?: ReactNode;
  };
  shell?: {
    className?: string;
    testId?: string;
  };
};

export function ContentCardShell({
  href,
  content,
  media,
  slots,
  shell,
}: ContentCardShellProps) {
  const className = shell?.className;
  const testId = shell?.testId;

  if (slots?.skeleton) {
    return (
      <Card
        className={cn(
          "h-full rounded-sm bg-slate-100 py-5 backdrop-blur sm:pb-6 gap-0 pt-0",
          className
        )}
        data-testid={testId}
      >
        {slots.skeleton}
      </Card>
    );
  }
  const hasImage = Boolean(media?.imageUrl);
  const safeUrl = media?.imageUrl ?? "";

  const imageSizes =
    media?.imageSize === "small"
      ? "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
      : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw";

  const card = (
    <Card
      className={cn(
        "h-full rounded-sm bg-slate-100 py-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm group-hover/card-link:border-[#009ca6] sm:pb-6",
        hasImage ? "gap-0 pt-0" : "gap-5 sm:gap-6",
        className
      )}
      data-testid={href ? undefined : testId}
    >
      {hasImage && (
        <div
          className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-t-sm"
          data-testid={testId && join(testId, "image")}
        >
          <Image
            src={safeUrl}
            alt={media?.imageAlt ?? content.title}
            fill
            sizes={imageSizes}
            className="object-cover"
            {...getImagePlaceholderProps(media?.imageUrl, media?.blurDataURL)}
          />
        </div>
      )}
      <CardHeader
        className={cn(
          "flex flex-row items-start justify-between gap-4 px-5 sm:px-6",
          content.kicker || slots?.headerAddon ? "pb-0" : undefined,
          hasImage ? "pt-6" : undefined
        )}
      >
        <div className="min-w-0 space-y-1.5">
          {content.kicker && (
            <ContentSuperheading
              className="group-hover/card-link:text-[#009ca6]"
              data-testid={testId && join(testId, "kicker")}
            >
              {content.kicker}
            </ContentSuperheading>
          )}
          <CardTitle
            className="text-xl leading-6 text-foreground transition-colors group-hover/card-link:text-[#009ca6] sm:text-2xl sm:leading-tight"
            data-testid={testId && join(testId, "title")}
          >
            <span>{content.title}</span>
          </CardTitle>
        </div>
        {slots?.headerAddon && (
          <div className="shrink-0 pt-1" data-testid={testId && join(testId, "header-addon")}>
            {slots.headerAddon}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5 px-5 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {content.summary && (
            typeof content.summary === "string" ? (
              <p
                className="text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7"
                data-testid={testId && join(testId, "summary")}
              >
                {content.summary}
              </p>
            ) : (
              content.summary
            )
          )}
        </div>
        {content.meta && (
          <div className="space-y-1 text-sm text-foreground/62" data-testid={testId && join(testId, "meta")}>
            {content.meta}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!href) {
    return card;
  }

  return (
    <Link href={href} className="group/card-link block h-full cursor-pointer" data-testid={testId}>
      {card}
    </Link>
  );
}
