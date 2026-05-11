import { Handshake, ShieldCheck, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";

type HomeTrustPillar = {
  heading: string;
  body: string;
};

type HomeTrustSectionProps = {
  heading?: string;
  pillars?: HomeTrustPillar[];
};

const defaultPillars = [
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

const icons = [ShieldCheck, SlidersHorizontal, Handshake];

export function HomeTrustSection({
  heading = 'Netaş Academy, kurumsal öğrenmeyi teknoloji ve sektör deneyimiyle yeniden tanımlar.',
  pillars = defaultPillars,
}: HomeTrustSectionProps = {}) {
  return (
    <section className="bg-background">
      <div className="page-container py-10 sm:py-12 lg:py-14">
        <h2 className="mx-auto mb-8 max-w-4xl text-center text-foreground text-3xl font-normal leading-tight md:text-5xl">
          {heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = icons[index] ?? ShieldCheck;

            return (
              <div
                key={index}
                className="py-3 border-t border-border md:py-0 md:border-t-0 md:border-l md:px-8 first:border-l-0 first:pl-0"
              >
                <Icon aria-hidden="true" size={36} weight="duotone" className="mb-4 text-primary" />
                <p className="text-foreground text-sm font-semibold uppercase tracking-[0.2em] mb-3">
                  {pillar.heading}
                </p>
                <p className="text-foreground/60 text-sm font-normal leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
