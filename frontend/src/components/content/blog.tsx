import type { ReactNode } from "react";
import Image from "next/image";

import { SiteBreadcrumbs, type BreadcrumbItem } from "@/components/breadcrumbs";
import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { cn } from "@/lib/utils";
import { join } from "@/lib/testids";

export type BlogListItem = {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedDate?: string | null;
  authorName?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
};

type BlogListProps = {
  items: BlogListItem[];
  emptyMessage?: string;
  testId?: string;
};

type BlogDetailProps = {
  breadcrumbItems?: BreadcrumbItem[];
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
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
  testId,
}: BlogListProps) {
  const resolvedTestId = testId ?? "blog-yazilari.list";
  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      testId={resolvedTestId}
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
            testId={join("blog-yazilari", "card", post.slug)}
            className="bg-white"
            imageUrl={post.coverImageUrl ?? null}
            imageAlt={post.coverImageAlt ?? undefined}
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
  breadcrumbItems,
  title,
  excerpt,
  coverImageUrl,
  coverImageAlt,
  meta,
  children,
  afterContent,
  sourceNotes,
}: BlogDetailProps) {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="blog-yazilari.detail">
      <section
        className={cn(
          "relative isolate overflow-hidden border-b border-white/10",
          coverImageUrl
            ? "bg-slate-950"
            : "bg-[linear-gradient(135deg,#009ca6_0%,#0f4c81_100%)]"
        )}
      >
        {coverImageUrl ? (
          <>
            <div className="absolute inset-0" data-testid="blog-yazilari.detail.cover-image">
              <Image
                src={coverImageUrl}
                alt={coverImageAlt ?? title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          </>
        ) : null}

        <div className="page-container relative z-10 flex min-h-[280px] items-end py-8 sm:min-h-[340px] sm:py-12 lg:min-h-[400px]">
          <div className="absolute left-4 right-4 top-8 sm:left-6 sm:right-6 sm:top-12 lg:left-10 lg:right-10 xl:left-12 xl:right-12">
            <SiteBreadcrumbs
              items={
                breadcrumbItems ?? [
                  { label: "Blog", href: "/blog-yazilari" },
                  { label: title },
                ]
              }
            />
          </div>
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/82">
              Blog
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl" data-testid="blog-yazilari.detail.title">
              {title}
            </h1>
            {excerpt ? (
              <p className="max-w-2xl text-[15px] leading-7 text-white/76 sm:text-lg sm:leading-8" data-testid="blog-yazilari.detail.excerpt">
                {excerpt}
              </p>
            ) : null}
            {meta ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-sm leading-6 text-white/76 sm:text-base" data-testid="blog-yazilari.detail.meta">
                {meta}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="page-section pt-8 sm:pt-10 lg:pt-12">
        <article className="max-w-4xl" data-testid="blog-yazilari.detail.body">
          <div className="max-w-3xl">
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-7 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 sm:leading-8">
              {children}
            </div>
          </div>

          {sourceNotes ? (
            <div className="mt-8 border-t border-white/10 pt-6 sm:mt-10 sm:pt-8" data-testid="blog-yazilari.detail.source-notes">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/46">
                Dayanak / Kaynak
              </p>
              <div className="mt-3 text-sm leading-6 text-foreground/62 sm:text-base sm:leading-7">
                {sourceNotes}
              </div>
            </div>
          ) : null}

          <div data-testid="blog-yazilari.detail.after-content">{afterContent}</div>
        </article>
      </section>
    </main>
  );
}
