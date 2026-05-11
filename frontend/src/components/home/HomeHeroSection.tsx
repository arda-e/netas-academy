'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { buildIntentLeadUrl } from '@/lib/lead-intents';

const slides = [
  {
    headline: 'Ekibinizin değişime uyum hızını artırın',
    subtitle:
      'Teknoloji ve sektör birikimini uygulamalı öğrenmeye dönüştüren programlarla kurumsal dönüşümü hızlandırıyoruz.',
  },
  {
    headline: 'Beceri açığını kapatın, adaptasyon kültürü inşa edin',
    subtitle:
      'Kurumun kendi iş bağlamına göre kurgulanmış eğitimler, ekiplerin değişime daha hazır hale gelmesini sağlar.',
  },
  {
    headline: 'Değişim yönetimini ekibinizin içinden başlatın',
    subtitle:
      'Sahada denenmiş yöntemler ve gerçek iş problemleri üzerinden ilerleyen öğrenme tasarımı ile fark yaratın.',
  },
];

export function HomeHeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[clamp(640px,90svh,1000px)] items-center justify-center overflow-hidden bg-slate-950">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,oklch(0.65_0.12_205.25/0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,oklch(0.65_0.12_205.25/0.12),transparent_50%)]" />

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-12 pb-20">
        <div className="relative w-full min-h-[20rem]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-end transition-opacity duration-700 ease-in-out ${
                index === current
                  ? 'opacity-100 pointer-events-auto relative'
                  : 'opacity-0 pointer-events-none absolute inset-x-0'
              }`}
            >
              <div className="lg:w-2/3">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal text-white leading-tight">
                  {slide.headline}
                </h1>
              </div>
              <div className="lg:w-1/3 lg:pl-8 mt-6 lg:mt-0">
                <p className="text-base text-white/75 leading-relaxed max-w-sm">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row lg:flex-col gap-3">
                  <Link
                    href={buildIntentLeadUrl("corporate_training_request")}
                    data-measurement-id="home_hero_corporate_cta"
                    data-testid="page.home.hero.cta.corporate-training"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90"
                  >
                    Kurumsal Eğitim Talep Et
                  </Link>
                  <Link
                    href="/egitimler"
                    data-measurement-id="home_hero_catalog_cta"
                    data-testid="page.home.hero.cta.catalog"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Eğitimleri İncele
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-8 left-4 sm:left-6 lg:left-10 xl:left-12 z-10 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`${index + 1}. slayta git`}
            className={`w-2.5 h-2.5 rounded-full border-0 p-0 cursor-pointer transition-colors duration-300 ${
              index === current ? 'bg-white' : 'bg-white/35'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
