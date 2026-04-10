import type { ReactNode } from "react";

type ContentPageShellProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

export function ContentPageShell({
  eyebrow,
  title,
  description,
  children,
}: ContentPageShellProps) {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/10 bg-[linear-gradient(135deg,#009ca6_0%,#0f4c81_100%)]">
        <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/82">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {title}
            </h1>
            {description ? (
              <div className="max-w-2xl space-y-4 text-lg leading-8 text-white/76">
                {description}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 md:px-10 lg:px-12">
        <div>{children}</div>
      </section>
    </main>

  );
}
