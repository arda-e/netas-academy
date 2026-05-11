import Link from 'next/link';

export function HomeProgramsSection() {
  return (
    <section className="bg-background">
      <div className="flex flex-col lg:flex-row">
        {/* Left — explanatory text */}
        <div className="lg:w-1/2 py-20 sm:py-24 px-4 sm:px-6 lg:px-10 xl:px-12 flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72 mb-4">
            Kuruma Özel Tasarım
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-foreground leading-snug mb-6">
            Kurumunuzun ihtiyaçlarına göre şekillenen programlar
          </h2>
          <div className="text-foreground/60 text-base leading-relaxed space-y-4">
            <p>
              Her kurumun sektörü, ekip yapısı ve gelişim öncelikleri farklıdır.
              Programlarımız bu farklılıkları temel alır: sektöre özgü vaka
              çalışmaları, mevcut beceri düzeyine uyarlanmış içerik ve kurumun
              stratejik hedefleriyle örtüşen çıktılar.
            </p>
            <p>
              İster açık sınıf ister kapalı devre; ister yüz yüze ister hibrit
              formatta olsun, programın çerçevesi kurumun kendi dinamiklerine
              göre yeniden kurgulanır. Hedef: ekibinizin gerçekten değişmesi.
            </p>
          </div>
          <Link
            href="/egitimler"
            data-measurement-id="home_programs_catalog_cta"
            className="mt-8 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/70 transition-colors self-start"
          >
            Eğitim Kataloğunu İncele
          </Link>
        </div>

        {/* Right — visual panel */}
        <div className="lg:w-1/2 min-h-[400px] bg-primary/10 flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-6xl font-light text-primary/25 leading-none">NA</p>
            <p className="text-xs uppercase tracking-widest text-primary/40 mt-3">Netaş Academy · Kuruma Özel</p>
          </div>
        </div>
      </div>
    </section>
  );
}
