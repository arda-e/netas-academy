import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/egitimler", label: "Eğitimler" },
  { href: "/blog-yazilari", label: "Blog Yazıları" },
  { href: "/haberler", label: "Haberler" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-background/72 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-10 lg:px-12">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Netas Academy ana sayfası"
        >
          <Image
            src="/netas-academy.svg"
            alt="Netas Academy"
            width={388}
            height={98}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-sm border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all",
                "hover:border-white/10 hover:bg-white/5 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
