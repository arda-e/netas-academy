import type { Metadata } from "next";

import cookieNoticeData from "@/data/cerez-aydinlatma-metni.json";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { CookieNoticeBackButton } from "@/components/cookie-notice-back-button";
import { HeroGradientBackground } from "@/components/hero-gradient-background";
import { Link } from "@/i18n/navigation";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo-utils";

type Params = {
  locale: string;
};

type PageSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type CookieNoticeData = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  sections: PageSection[];
};

const cookieNotice = cookieNoticeData as CookieNoticeData;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = buildLocalePath(locale, "/cerez-aydinlatma-metni");

  return {
    title: "Çerez Aydınlatma Metni | Netas Academy",
    description:
      "Netas Academy'nin çerez kullanımı ve tarayıcı depolaması hakkında aydınlatma metni.",
    alternates: {
      canonical,
      languages: buildLocaleAlternates("/cerez-aydinlatma-metni"),
    },
    openGraph: {
      locale: locale === "en" ? "en_US" : "tr_TR",
      title: "Çerez Aydınlatma Metni | Netas Academy",
      description:
        "Netas Academy'nin çerez kullanımı ve tarayıcı depolaması hakkında aydınlatma metni.",
      url: canonical,
    },
  };
}

export default function CookieNoticePage() {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="page.cookie-notice">
      <section className="relative isolate overflow-hidden border-b border-white/8 bg-slate-950">
        <HeroGradientBackground variant="legal" testId="page.cookie-notice.hero-gradient" />
        <div className="page-container relative flex min-h-[300px] w-full flex-col justify-end gap-6 py-8 sm:min-h-[360px] sm:py-12">
          <div className="flex w-full items-start justify-between gap-4">
            <SiteBreadcrumbs items={[{ label: cookieNotice.hero.title }]} />
            <CookieNoticeBackButton />
          </div>
          <div className="max-w-4xl space-y-4 sm:space-y-5">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl">
              {cookieNotice.hero.title}
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-white/88 sm:text-lg sm:leading-8">
              {cookieNotice.hero.description}
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="space-y-4 sm:space-y-5">
          {cookieNotice.sections.map((section) => (
            <article key={section.heading} className="panel-surface rounded-sm p-4 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="max-w-4xl page-body-text">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-5 space-y-3 page-body-text sm:mt-6">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Hızlı Bağlantılar
            </h2>
            <p className="mt-3 max-w-4xl page-body-text sm:mt-4">
              Daha geniş gizlilik çerçevesi için KVKK metnini inceleyebilir veya
              doğrudan iletişime geçebilirsiniz.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap">
              <Link
                href="/kvkk"
                className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                data-testid="page.cookie-notice.link.kvkk"
              >
                KVKK Aydınlatma Metni
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center rounded-sm border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
                data-testid="page.cookie-notice.link.contact"
              >
                İletişim
              </Link>
            </div>
          </article>

          <div className="flex justify-start pt-2">
            <CookieNoticeBackButton />
          </div>
        </div>
      </section>
    </main>
  );
}
