'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { join } from "@/lib/testids";

import { headerNavigationItems } from "@/config/navigation";

function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navigationLinkActiveClassName = "text-[#0f4c81]";

const desktopNavigationLinkClassName =
  "flex items-center border-x px-4 text-sm font-medium transition-all";

const desktopNavigationLinkInactiveClassName =
  "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/70 hover:text-foreground";

const mobileNavigationLinkClassName =
  "w-full rounded-sm border px-4 py-3 text-left text-base font-medium transition-all";

const mobileNavigationLinkInactiveClassName =
  "border-transparent text-foreground hover:border-border hover:bg-white/70";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const ht = useTranslations('header');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-2xl">
      <div className="page-container flex min-h-16 items-stretch justify-between gap-4 sm:gap-6">
        <Link
          href="/"
          className="flex items-center py-4"
          aria-label={ht('logo.aria_label')}
          data-testid="site-header.logo-link"
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
          aria-label={isMobileMenuOpen ? ht('mobile_menu.toggle_label_close') : ht('mobile_menu.toggle_label_open')}
          data-testid="site-header.mobile-menu.toggle"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {ht('mobile_menu.button_text')}
        </button>

        <nav className="hidden flex-wrap items-stretch justify-end gap-0 md:flex" data-testid="site-header.desktop-nav">
          {headerNavigationItems.map((item) => {
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                data-testid={join("site-header", "desktop-nav", item.routeKey)}
                className={cn(
                  desktopNavigationLinkClassName,
                  isActive
                    ? `border-primary/20 bg-primary/10 ${navigationLinkActiveClassName} shadow-[inset_0_-3px_0_var(--primary)]`
                    : desktopNavigationLinkInactiveClassName
                )}
              >
                {t(item.routeKey)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-0 border-l border-border/70 pl-4 md:flex" data-testid="site-header.locale-switcher">
          <Link
            href={pathname}
            aria-label="Türkçe"
            data-testid="site-header.locale-switcher.tr"
            className={cn(
              "rounded-l-sm px-2 py-1 text-sm font-medium transition-colors",
              locale === 'tr'
                ? "bg-primary/10 text-[#0f4c81]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            TR
          </Link>
          <Link
            href={`/en${pathname}`}
            aria-label="English"
            data-testid="site-header.locale-switcher.en"
            className={cn(
              "rounded-r-sm px-2 py-1 text-sm font-medium transition-colors",
              locale === 'en'
                ? "bg-primary/10 text-[#0f4c81]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            EN
          </Link>
        </div>
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
          data-testid="site-header.mobile-nav"
        >
          {headerNavigationItems.map((item) => {
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                data-testid={join("site-header", "mobile-nav", item.routeKey)}
                className={cn(
                  mobileNavigationLinkClassName,
                  isActive
                    ? `border-primary/30 bg-white ${navigationLinkActiveClassName} shadow-[inset_3px_0_0_var(--primary)]`
                    : mobileNavigationLinkInactiveClassName
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t(item.routeKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
