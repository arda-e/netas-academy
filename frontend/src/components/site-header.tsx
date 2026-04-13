'use client';

import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-2xl">
      <div className="page-container flex items-center justify-between gap-4 py-4 sm:gap-6">
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

        <button
          type="button"
          className="inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 md:hidden"
          aria-expanded={isMobileMenuOpen}
          aria-controls="site-mobile-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          Menü
        </button>

        <nav className="hidden flex-wrap items-center justify-end gap-2 md:flex md:gap-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-sm border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all",
                "hover:border-border hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
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
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full rounded-sm border border-transparent px-4 py-3 text-left text-base font-medium text-foreground transition-all",
                "hover:border-border hover:bg-white/70"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
