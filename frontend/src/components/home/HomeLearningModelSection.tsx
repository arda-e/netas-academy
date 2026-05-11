export function HomeLearningModelSection() {
  return (
    <section className="bg-gray-100">
      <div className="page-container py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            Öğrenme modeli
          </span>
          <h2 className="mt-4 text-3xl font-normal leading-tight text-foreground md:text-4xl">
            Vaka, senaryo ve gerçek iş problemleriyle öğrenme
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-foreground/60 md:text-base">
            Eğitimlerimiz teorik aktarımın ötesinde; katılımcıların kendi iş
            bağlamlarına taşıyabileceği somut yöntemler ve uygulamalı çalışma
            biçimleri üzerine kurulur.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12 lg:divide-x lg:divide-border/60">
          <div className="space-y-4 lg:pr-10">
            <h3 className="text-2xl font-normal leading-snug text-foreground md:text-3xl">
              Aktif katılım ve uygulama
            </h3>
            <p className="text-sm leading-relaxed text-foreground/60 md:text-base">
              Grup çalışmaları, anlık geri bildirim döngüleri ve sahaya taşınan
              alıştırmalarla öğrenme kalıcı hale gelir.
            </p>
          </div>

          <div className="space-y-4 lg:pl-10">
            <h3 className="text-2xl font-normal leading-snug text-foreground md:text-3xl">
              İş Bağlamı
            </h3>
            <p className="text-sm leading-relaxed text-foreground/60 md:text-base">
              Eğitimlerimiz teorik aktarımın ötesinde; katılımcıların kendi iş
              bağlamlarına taşıyabileceği somut yöntemler ve uygulamalı çalışma
              biçimleri üzerine kurulur.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
