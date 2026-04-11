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
        <div className="page-container flex min-h-[320px] items-end py-10 sm:min-h-[360px] sm:py-12 lg:min-h-[400px]">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-white/82">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-6xl">
              {title}
            </h1>
            {description ? (
              <div className="max-w-2xl space-y-4 text-base leading-7 text-white/76 sm:text-lg sm:leading-8">
                {description}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="page-section pt-8 sm:pt-10">
        <div>{children}</div>
      </section>
    </main>

  );
}
