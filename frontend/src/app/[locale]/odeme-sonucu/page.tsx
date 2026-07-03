import type { Metadata } from "next";
import { CheckCircle2, Clock3, RotateCcw, XCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { HeroGradientBackground } from "@/components/hero-gradient-background";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";

type PaymentResultStatus = "paid" | "failed" | "cancelled" | "pending";

type PaymentResultPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    attemptReference?: string;
    status?: string;
    duplicate?: string;
  }>;
};

export const dynamic = "force-dynamic";

function resolveStatus(value?: string): PaymentResultStatus {
  if (value === "paid" || value === "failed" || value === "cancelled") {
    return value;
  }

  return "pending";
}

function getStatusVisual(status: PaymentResultStatus) {
  if (status === "paid") {
    return {
      Icon: CheckCircle2,
      className: "border-emerald-500/30 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "failed" || status === "cancelled") {
    return {
      Icon: XCircle,
      className: "border-rose-500/30 bg-rose-50 text-rose-700",
    };
  }

  return {
    Icon: Clock3,
    className: "border-amber-500/30 bg-amber-50 text-amber-700",
  };
}

export async function generateMetadata({
  params,
}: PaymentResultPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payment_result" });
  const canonical = buildLocalePath(locale, "/odeme-sonucu");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
      languages: buildLocaleAlternates("/odeme-sonucu"),
    },
    openGraph: {
      locale: locale === "en" ? "en_US" : "tr_TR",
      title: t("meta.title"),
      description: t("meta.description"),
      url: canonical,
    },
  };
}

export default async function PaymentResultPage({
  params,
  searchParams,
}: PaymentResultPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const t = await getTranslations("payment_result");
  const status = resolveStatus(query.status);
  const { Icon, className } = getStatusVisual(status);
  const attemptReference = query.attemptReference?.trim();
  const isDuplicate = query.duplicate === "true";

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="page.payment-result">
      <section className="relative isolate overflow-hidden border-b border-white/8 bg-slate-950">
        <HeroGradientBackground variant="events" testId="page.payment-result.hero-gradient" />
        <div className="relative mx-auto flex min-h-[360px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-12 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs items={[{ label: t("breadcrumbs.current") }]} />
          </div>
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/88">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              {t("hero.body")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="panel-surface rounded-sm p-6 md:p-8" data-testid={`payment-result.${status}`}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-sm border", className)}>
              <Icon aria-hidden="true" className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-5">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {t(`status.${status}.title`)}
                </h2>
                <p className="text-base leading-7 text-muted-foreground">
                  {t(`status.${status}.body`)}
                </p>
              </div>

              {attemptReference ? (
                <div className="rounded-sm border border-border/70 bg-card/55 px-4 py-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t("details.attempt_reference")}</span>{" "}
                  <span className="break-all">{attemptReference}</span>
                </div>
              ) : null}

              {isDuplicate ? (
                <p className="text-sm leading-6 text-muted-foreground" data-testid="payment-result.duplicate">
                  {t("details.duplicate")}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                {(status === "failed" || status === "cancelled") ? (
                  <Button asChild className="h-11 rounded-sm px-5">
                    <Link href="/etkinlikler">
                      <RotateCcw aria-hidden="true" className="size-4" />
                      {t("actions.retry")}
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant={status === "paid" ? "default" : "outline"} className="h-11 rounded-sm px-5">
                  <Link href="/etkinlikler">{t("actions.events")}</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-sm px-5">
                  <Link href="/iletisim">{t("actions.contact")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
