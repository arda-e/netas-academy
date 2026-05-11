const pillars = [
  {
    heading: 'Netaş Teknoloji ve Sektör Güvencesi',
    body: 'Programlar, Netaş\'ın onlarca yıllık teknoloji ve sektör birikiminin üzerine inşa edilir. Teorik çerçeve değil, sahada denenmiş yöntemler temel alınır.',
  },
  {
    heading: 'Kuruma Özel Şekillenen Yaklaşım',
    body: 'Her program, kurumun sektörüne, ekip yapısına ve gelişim hedeflerine göre yeniden kurgulanır. Hazır içerik değil, ihtiyaca göre tasarlanmış bir öğrenme deneyimi sunulur.',
  },
  {
    heading: 'Uzun Vadeli Ortaklık Modeli',
    body: 'Tek seferlik eğitim yerine, kurumun dönüşüm yolculuğuna eşlik eden sürdürülebilir bir öğrenme ilişkisi kurulur.',
  },
];

export function HomeTrustSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12 py-20 sm:py-24 lg:py-28">
        <h2 className="text-foreground text-3xl md:text-5xl font-normal leading-tight max-w-[75%] mb-16">
          Netaş Academy, kurumsal öğrenmeyi teknoloji ve sektör deneyimiyle yeniden tanımlar.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="py-6 border-t border-border md:py-0 md:border-t-0 md:border-l md:px-8 first:border-l-0 first:pl-0"
            >
              <p className="text-foreground text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                {pillar.heading}
              </p>
              <p className="text-foreground/60 text-sm font-normal leading-relaxed">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
