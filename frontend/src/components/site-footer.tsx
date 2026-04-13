import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-white/95 backdrop-blur-2xl">
      <div className="page-container flex flex-col gap-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-foreground/72">
          Netas Academy
        </p>

        <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Link
            href="/kvkk"
            className="rounded-sm border border-transparent px-3 py-2 text-left transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
          >
            KVKK
          </Link>
          <a
            href="https://netas.com.tr/"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm border border-transparent px-3 py-2 text-left transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
          >
            Netaş Web Sitesi
          </a>
        </nav>
      </div>
    </footer>
  );
}
