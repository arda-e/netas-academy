import type { ReactNode } from "react";

type ContentDetailShellProps = {
  leadMedia?: ReactNode;
  eyebrow?: string;
  title: string;
  summary?: string;
  meta?: ReactNode;
  children: ReactNode;
  afterContent?: ReactNode;
};

export function ContentDetailShell({
  leadMedia,
  eyebrow,
  title,
  summary,
  meta,
  children,
  afterContent,
}: ContentDetailShellProps) {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <article className="mx-auto w-full max-w-7xl px-6 py-18 md:px-10 lg:px-12">
        <div
          className={
            leadMedia
              ? "flex flex-col gap-8 md:flex-row md:items-center md:gap-10"
              : ""
          }
        >
          {leadMedia ? <div className="shrink-0">{leadMedia}</div> : null}
          <div className="max-w-3xl space-y-5">
          {eyebrow ? (
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-primary/76">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
          {summary ? (
            <p className="max-w-2xl text-lg leading-8 text-foreground/72">
              {summary}
            </p>
          ) : null}
        </div>
        </div>

        <div className="panel-surface mt-10 w-full rounded-sm p-8 md:p-12">
          {meta ? (
            <div className="mb-8 space-y-2 border-b border-white/8 pb-8 text-base text-foreground/68">
              {meta}
            </div>
          ) : null}
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-8 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80">
            {children}
          </div>
          {afterContent}
        </div>
      </article>
    </main>
  );
}
