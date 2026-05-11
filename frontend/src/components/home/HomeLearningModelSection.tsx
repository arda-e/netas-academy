import Link from 'next/link';

export function HomeLearningModelSection() {
  return (
    <section className="flex flex-col lg:flex-row">
      {/* Col 1 — light bg, overview + CTA */}
      <div className="lg:w-1/3 bg-background p-12 lg:p-16 flex flex-col justify-between">
        <div>
          <span className="inline-block text-xs uppercase tracking-widest bg-primary/10 text-primary rounded-full px-3 py-1">
            Öğrenme modeli
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mt-4 leading-tight">
            Vaka, senaryo ve gerçek iş problemleriyle öğrenme
          </h2>
          <p className="text-foreground/60 mt-4 leading-relaxed text-sm">
            Eğitimlerimiz teorik aktarımın ötesinde; katılımcıların kendi iş
            bağlamlarına taşıyabileceği somut yöntemler ve uygulamalı çalışma
            biçimleri üzerine kurulur.
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/egitimler"
            data-measurement-id="home_learning_catalog_cta"
            className="inline-block w-full text-center border border-foreground/30 text-foreground py-3 rounded-full text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            Eğitimleri İncele
          </Link>
        </div>
      </div>

      {/* Col 2 — dark bg, real business problems */}
      <div className="lg:w-1/3 flex flex-col justify-end p-12 lg:p-16 min-h-[400px] lg:min-h-0 bg-slate-950">
        <span className="inline-block text-xs uppercase tracking-widest bg-white/10 text-white/70 rounded px-3 py-1 mb-4 self-start">
          Gerçek iş problemleri
        </span>
        <h2 className="text-2xl font-normal text-white leading-snug">
          Ekibinizin kendi sorunları üzerinden ilerleyen bir öğrenme akışı
        </h2>
        <p className="text-white/60 mt-3 text-sm leading-relaxed">
          Simüle edilmiş senaryolar değil; kurumun gerçek iş gündeminden
          beslenen vaka çalışmaları, öğrenmeyi anlamlı kılar.
        </p>
      </div>

      {/* Col 3 — muted bg, interactive & applied */}
      <div className="lg:w-1/3 flex flex-col">
        <div className="flex-1 bg-muted min-h-[260px] flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-5xl font-light text-foreground/20">NA</p>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mt-2">Netaş Academy</p>
          </div>
        </div>
        <div className="bg-background p-8 lg:p-10">
          <p className="text-xs uppercase tracking-widest text-foreground/50 mb-3">
            İnteraktif ve uygulamalı
          </p>
          <h3 className="text-lg font-normal text-foreground leading-snug mb-3">
            Pasif izleme değil, aktif katılım ve uygulama
          </h3>
          <p className="text-sm text-foreground/60 leading-relaxed">
            Grup çalışmaları, anlık geri bildirim döngüleri ve sahaya taşınan
            alıştırmalarla öğrenme kalıcı hale gelir.
          </p>
        </div>
      </div>
    </section>
  );
}
