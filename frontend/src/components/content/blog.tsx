import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";

export type BlogListItem = {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedDate?: string | null;
  authorName?: string | null;
};

type BlogListProps = {
  items: BlogListItem[];
  emptyMessage?: string;
};

type BlogDetailProps = {
  title: string;
  excerpt?: string | null;
  meta?: ReactNode;
  children: ReactNode;
  afterContent?: ReactNode;
  sourceNotes?: ReactNode;
};

const formatBlogDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export function BlogList({
  items,
  emptyMessage = "Gösterilecek blog verisi şu an kullanılabilir değil.",
}: BlogListProps) {
  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      columnsClassName={responsiveLayoutClasses.blogListGrid}
    >
      {items.map((post) => {
        const hasMeta = post.publishedDate || post.authorName;

        return (
          <ContentCardShell
            key={post.id}
            href={`/blog-yazilari/${post.slug}`}
            title={post.title}
            summary={post.excerpt ?? "Bu yazı için özet yakında eklenecek."}
            className="bg-white"
            meta={
              hasMeta ? (
                <div className="space-y-1.5 text-sm leading-6 text-foreground/62">
                  {post.publishedDate ? <p>{formatBlogDate(post.publishedDate)}</p> : null}
                  {post.authorName ? <p>{post.authorName}</p> : null}
                </div>
              ) : undefined
            }
          />
        );
      })}
    </ContentGrid>
  );
}

export function BlogDetail({
  title,
  excerpt,
  meta,
  children,
  afterContent,
  sourceNotes,
}: BlogDetailProps) {
  return (
    <ContentDetailShell
      eyebrow="Blog Yazıları"
      title={title}
      summary={excerpt ?? undefined}
      meta={meta}
      afterContent={afterContent}
    >
      {children}
      {sourceNotes ? (
        <div className="mt-8 border-t border-white/10 pt-6 sm:mt-10 sm:pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/46">
            Dayanak / Kaynak
          </p>
          <div className="mt-3 text-sm leading-6 text-foreground/62 sm:text-base sm:leading-7">
            {sourceNotes}
          </div>
        </div>
      ) : null}
    </ContentDetailShell>
  );
}
