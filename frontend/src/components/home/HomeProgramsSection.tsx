import Link from 'next/link';

type HomeProgramsSectionProps = {
  eyebrow?: string;
  heading?: string;
  body1?: string;
  body2?: string;
  ctaLabel?: string;
};

export function HomeProgramsSection({
  eyebrow = 'Kuruma Özel Tasarım',
  heading = 'Kurumunuzun ihtiyaçlarına göre şekillenen programlar',
  body1 = 'Her kurumun sektörü, ekip yapısı ve gelişim öncelikleri farklıdır. Programlarımız bu farklılıkları temel alır: sektöre özgü vaka çalışmaları, mevcut beceri düzeyine uyarlanmış içerik ve kurumun stratejik hedefleriyle örtüşen çıktılar.',
  body2 = 'İster açık sınıf ister kapalı devre; ister yüz yüze ister hibrit formatta olsun, programın çerçevesi kurumun kendi dinamiklerine göre yeniden kurgulanır. Hedef: ekibinizin gerçekten değişmesi.',
  ctaLabel = 'Eğitim Kataloğunu İncele',
}: HomeProgramsSectionProps = {}) {
  return (
    <section className="bg-gray-100">
      <div className="page-container py-10 sm:py-12 lg:py-14">
        <div className="grid overflow-hidden lg:grid-cols-2 lg:divide-x lg:divide-border/60">
          {/* Left — explanatory text */}
          <div className="bg-transparent p-6 lg:p-8 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72 mb-4">
              {eyebrow}
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-foreground leading-snug mb-6">
              {heading}
            </h2>
            <div className="text-foreground/60 text-base leading-relaxed space-y-4">
              <p>
                {body1}
              </p>
              <p>
                {body2}
              </p>
            </div>
            <Link
              href="/egitimler"
              data-measurement-id="home_programs_catalog_cta"
              className="mt-8 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/70 transition-colors self-start"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Right — visual panel */}
          <div className="min-h-[220px] bg-primary/10 flex items-center justify-center p-6 lg:p-8">
            <div className="text-center px-8">
              <p className="text-6xl font-light text-primary/25 leading-none">NA</p>
              <p className="text-xs uppercase tracking-widest text-primary/40 mt-3">Netaş Academy · Kuruma Özel</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
