const outcomes = [
  'Öğrenilen yöntemleri kendi iş bağlamına taşıma ve uygulama becerisi',
  'Aynı iş problemlerine yeni perspektiflerden bakabilme alışkanlığı',
  'Ekip içinde kullanılabilir pratik araçlar ve çalışma çerçeveleri',
  'Kurumda uygulanabilir, sürdürülebilir yöntemler ve öğrenme alışkanlıkları',
];

export function HomeOutcomesSection() {
  return (
    <div>
      {/* Split-panel row — adapted from MetricsSection (first <section> only) */}
      <section className="flex flex-col lg:flex-row">
        {/* Light left panel — outcome title cards (large display type) */}
        <div className="lg:w-1/2 bg-muted min-h-[360px] lg:min-h-0 flex flex-col items-center justify-center p-12 lg:p-16 gap-10">
          <p className="text-[5rem] sm:text-[7rem] font-light text-foreground/15 leading-none select-none text-center">
            Teoriden
            <br />
            Pratiğe
          </p>
          <p className="text-3xl font-light text-foreground/30 leading-none select-none text-center">
            Yeni Bakış Açısı
          </p>
        </div>

        {/* Dark right panel — four outcome statements */}
        <div className="lg:w-1/2 bg-slate-950 py-16 px-8 md:px-12 lg:px-16 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-normal text-white leading-snug mb-10">
            Katılımcı Çıktıları
          </h2>
          <div className="space-y-8">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-4">
                <span className="mt-1 shrink-0 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-white/40 text-xs">
                  {index + 1}
                </span>
                <p className="text-sm text-white/70 leading-relaxed">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Second <section> (testimonial/quote strip) intentionally omitted — no real testimonial available for v1 */}
    </div>
  );
}
