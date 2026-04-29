'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/egitimler", label: "Eğitim Kataloğu" },
  { href: "/egitmenler", label: "Eğitmenler" },
  { href: "/cozum-ortagi", label: "Çözüm Ortağı" },
  { href: "/blog-yazilari", label: "Blog" },
  { href: "/haberler", label: "Haberler" },
  { href: "/iletisim", label: "İletişim" },
];

function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-2xl">
      <div className="page-container flex min-h-16 items-stretch justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          className="flex items-center py-4"
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

        <button
          type="button"
          className="my-3 inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 md:hidden"
          aria-expanded={isMobileMenuOpen}
          aria-controls="site-mobile-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          Menü
        </button>

        <nav className="hidden flex-wrap items-stretch justify-end gap-0 md:flex">
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center border-x px-4 text-sm font-medium transition-all",
                  isActive
                    ? "border-primary/20 bg-primary/10 text-[#0f4c81] shadow-[inset_0_-3px_0_var(--primary)]"
                    : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/70 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={cn(
          "page-container pb-4 md:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
      >
        <nav
          id="site-mobile-navigation"
          className="panel-surface flex flex-col gap-1 p-2"
        >
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "w-full rounded-sm border px-4 py-3 text-left text-base font-medium transition-all",
                  isActive
                    ? "border-primary/30 bg-white text-[#0f4c81] shadow-[inset_3px_0_0_var(--primary)]"
                    : "border-transparent text-foreground hover:border-border hover:bg-white/70"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
