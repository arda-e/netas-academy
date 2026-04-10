import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-white/95 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10 lg:px-12">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/72">
          Netas Academy
        </p>

        <nav className="flex flex-wrap items-center gap-3 md:justify-end">
          <Link
          href="/kvkk"
            className="rounded-sm border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
          >
            KVKK
          </Link>
          <a
            href="https://netas.com.tr/"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm border border-transparent px-3 py-2 transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
          >
            Netaş Web Sitesi
          </a>
        </nav>
      </div>
    </footer>
  );
}
