import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { join } from "@/lib/testids";

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

const formatNewsDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

function NewsCard({ item }: { item: NewsListItem }) {
  const meta: ReactNode = (
    <div className="space-y-1.5 break-words">
      {item.tag ? <p>{item.tag}</p> : null}
      {item.publishedAt ? <p>{formatNewsDate(item.publishedAt)}</p> : null}
    </div>
  );

  return (
    <ContentCardShell
      href={item.href}
      title={item.title}
      summary={item.summary}
      meta={meta}
      testId={join("haberler", "card", String(item.id))}
    />
  );
}

export function NewsList({
  items,
  emptyMessage = "Gosterilecek haber verisi su an kullanilabilir degil.",
}: NewsListProps) {
  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      testId="haberler.list"
      columnsClassName={responsiveLayoutClasses.newsListGrid}
    >
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </ContentGrid>
  );
}
