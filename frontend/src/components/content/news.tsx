import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { join } from "@/lib/testids";
import { formatLongDate } from "@/lib/date-formatting";

export type NewsListItem = {
  id: number | string;
  title: string;
  summary: string;
  href?: string;
  tag?: string;
  publishedAt?: string;
};

type NewsListProps = {
  items: NewsListItem[];
  emptyMessage?: string;
};

function NewsCard({ item }: { item: NewsListItem }) {
  const meta: ReactNode = (
    <div className="space-y-1.5 break-words">
      {item.tag ? <p>{item.tag}</p> : null}
      {item.publishedAt ? <p>{formatLongDate(item.publishedAt)}</p> : null}
    </div>
  );

  return (
    <ContentCardShell
      href={item.href}
      content={{
        title: item.title,
        summary: item.summary,
        meta,
      }}
      shell={{
        testId: join("haberler", "card", String(item.id)),
      }}
    />
  );
}

export function NewsList({
  items,
  emptyMessage = "Gosterilecek haber verisi su an kullanilabilir degil.",
}: NewsListProps) {
  return (
    <ContentGrid
      items={{
        count: items.length,
        emptyMessage,
      }}
      layout={{
        columnsClassName: responsiveLayoutClasses.newsListGrid,
      }}
      testId="haberler.list"
    >
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </ContentGrid>
  );
}
