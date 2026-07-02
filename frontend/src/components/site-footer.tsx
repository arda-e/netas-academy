import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { join } from "@/lib/testids";
import { footerSitePlanItems } from "@/config/navigation";

const footerLinkClassName =
  "rounded-sm border border-transparent text-left transition-all hover:ml-2 hover:font-semibold hover:text-[#009ca6]";

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const nt = await getTranslations('nav');
  return (
    <footer className="border-t border-border/80 bg-white/95 backdrop-blur-2xl">
      <div className="page-container grid gap-6 py-6 text-sm text-muted-foreground lg:grid-cols-[1fr_1fr_auto] lg:items-start">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground/72">
            {t('brand.name')}
          </p>
          <p className="max-w-80 text-sm leading-6">
            {t('brand.tagline')}
          </p>
        </div>

        <nav aria-label={t('site_plan.aria_label')} className="space-y-2" data-testid="site-footer.site-plan">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/72">
            {t('site_plan.heading')}
          </p>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
            {footerSitePlanItems.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={join("site-footer", "site-plan", item.routeKey)}
                  className={`${footerLinkClassName} block truncate py-1.5 pl-0 pr-3`}
                >
                  {nt(item.routeKey)}
                </Link>
              );
            })}
          </div>
        </nav>

        <nav
          aria-label={t('legal.aria_label')}
          className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end"
          data-testid="site-footer.legal"
        >
          <Link
            href="/kvkk"
            data-testid="site-footer.legal.kvkk"
            className={`${footerLinkClassName} px-3 py-2`}
          >
            {t('legal.kvkk')}
          </Link>
          <Link
            href="/cerez-aydinlatma-metni"
            data-testid="site-footer.legal.cookie-notice"
            className={`${footerLinkClassName} px-3 py-2`}
          >
            {t('legal.cookie_notice')}
          </Link>
          <a
            href="https://netas.com.tr/"
            target="_blank"
            rel="noreferrer"
            data-testid="site-footer.legal.netas-website"
            className={`${footerLinkClassName} px-3 py-2`}
          >
            {t('legal.netas_website')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
