import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { ContentDetailShell } from "@/components/content/content-detail-shell";

type BlogListItem = {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
};

type BlogListProps = {
  items: BlogListItem[];
  emptyMessage?: string;
};

type BlogDetailProps = {
  title: string;
  excerpt?: string | null;
  children: ReactNode;
  afterContent?: ReactNode;
};

export function BlogList({
  items,
  emptyMessage = "Gosterilecek blog verisi su an kullanilabilir degil.",
}: BlogListProps) {
  return (
    <ContentGrid itemsCount={items.length} emptyMessage={emptyMessage} columnsClassName="grid gap-4 sm:gap-6 lg:grid-cols-2">
      {items.map((post) => (
        <ContentCardShell
          key={post.id}
          href={`/blog-yazilari/${post.slug}`}
          title={post.title}
          summary={post.excerpt ?? "Bu yazi icin ozet yakinda eklenecek."}
        />
      ))}
    </ContentGrid>
  );
}

export function BlogDetail({ title, excerpt, children, afterContent }: BlogDetailProps) {
  return (
    <ContentDetailShell
      eyebrow="Blog Yazilari"
      title={title}
      summary={excerpt ?? undefined}
      afterContent={afterContent}
    >
      {children}
    </ContentDetailShell>
  );
}
