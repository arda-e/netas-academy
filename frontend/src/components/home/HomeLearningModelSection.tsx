type HomeLearningModelSectionProps = {
  leftHeading?: string;
  leftBody?: string;
  rightHeading?: string;
  rightBody?: string;
};

export function HomeLearningModelSection({
  leftHeading = 'Aktif katılım ve uygulama',
  leftBody = 'Grup çalışmaları, anlık geri bildirim döngüleri ve sahaya taşınan alıştırmalarla öğrenme kalıcı hale gelir.',
  rightHeading = 'İş Bağlamı',
  rightBody = 'Eğitimlerimiz teorik aktarımın ötesinde; katılımcıların kendi iş bağlamlarına taşıyabileceği somut yöntemler ve uygulamalı çalışma biçimleri üzerine kurulur.',
}: HomeLearningModelSectionProps = {}) {
  return (
    <section className="bg-gray-100">
      <div className="page-container py-10 sm:py-12 lg:py-14">
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12 lg:divide-x lg:divide-border/60">
          <div className="space-y-4 lg:pr-10">
            <h3 className="text-2xl font-normal leading-snug text-foreground md:text-3xl">
              {leftHeading}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/60 md:text-base">
              {leftBody}
            </p>
          </div>

          <div className="space-y-4 lg:pl-10">
            <h3 className="text-2xl font-normal leading-snug text-foreground md:text-3xl">
              {rightHeading}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/60 md:text-base">
              {rightBody}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
