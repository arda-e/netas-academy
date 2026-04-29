import Link from "next/link";

const sitePlanItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/egitimler", label: "Eğitim Kataloğu" },
  { href: "/egitmenler", label: "Eğitmenler" },
  { href: "/cozum-ortagi", label: "Çözüm Ortağı" },
  { href: "/blog-yazilari", label: "Blog" },
  { href: "/haberler", label: "Haberler" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-white/95 backdrop-blur-2xl">
      <div className="page-container grid gap-6 py-6 text-sm text-muted-foreground lg:grid-cols-[minmax(180px,0.8fr)_minmax(0,2fr)_auto] lg:items-start">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/72">
            Netas Academy
          </p>
          <p className="max-w-80 text-sm leading-6">
            Eğitim, etkinlik ve kurumsal gelişim içerikleri.
          </p>
        </div>

        <nav aria-label="Site planı" className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/72">
            Site Planı
          </p>
          <div className="flex flex-col gap-1">
            {sitePlanItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm border border-transparent px-3 py-1.5 text-left transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <nav
          aria-label="Yasal ve kurumsal bağlantılar"
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end"
        >
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
