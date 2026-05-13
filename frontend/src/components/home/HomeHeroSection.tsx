'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import heroImage from '@/assets/images/hero-events.webp';
import { getImagePlaceholderProps, type ImageSource } from '@/lib/image-sources';
import { buildIntentLeadUrl } from '@/lib/lead-intents';
import { cn } from '@/lib/utils';

type HomeHeroSlide = {
  headline: string;
  subtitle: string;
};

type HomeHeroSectionProps = {
  slides?: HomeHeroSlide[];
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  slideNavLabels?: string[];
  imageUrl?: ImageSource | null;
};

const defaultSlides = [
  {
    headline: 'Kurumsal öğrenmeyi iş bağlamına taşıyan programlar',
    subtitle:
      'Netaş Academy, teknoloji ve sektör deneyimini kurumunuza özel, uygulamalı öğrenme programlarına dönüştürür.',
  },
  {
    headline: 'Kurumunuza göre tasarlanan, sahada uygulanabilen eğitimler',
    subtitle:
      'Her program, ekibin ihtiyaçlarına ve iş önceliklerine göre yeniden kurgulanır; hazır paket değil, gerçek kullanım için öğrenme tasarımı sunar.',
  },
  {
    headline: 'Değişimi ekibin içinden başlatan öğrenme yaklaşımı',
    subtitle:
      'Sahada denenmiş yöntemler, vaka çalışmaları ve pratik uygulamalarla ekiplerin değişime daha hızlı uyum sağlamasına yardımcı olur.',
  },
];

export function HomeHeroSection({
  slides = defaultSlides,
  primaryCtaLabel = 'Kurumsal Eğitim Talep Et',
  secondaryCtaLabel = 'Eğitimleri İncele',
  slideNavLabels = [],
  imageUrl = heroImage,
}: HomeHeroSectionProps = {}) {
  const [current, setCurrent] = useState(0);
  const hasImage = Boolean(imageUrl);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      className={cn(
        "relative flex min-h-[clamp(300px,44svh,680px)] items-center justify-center overflow-hidden",
        hasImage ? "bg-slate-950" : "bg-[linear-gradient(135deg,#009ca6_0%,#0f4c81_100%)]",
      )}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          {...getImagePlaceholderProps(imageUrl)}
        />
      )}
      {hasImage ? (
        <div className="absolute inset-0 bg-slate-950/8" />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,oklch(0.65_0.12_205.25/0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,oklch(0.65_0.12_205.25/0.12),transparent_50%)]" />
        </>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 xl:px-12">
        <div className="relative w-full min-h-[8rem]">
          {slides.map((slide, index) => (
            <div
              key={slide.headline}
              className={`flex flex-col items-center text-center transition-opacity duration-700 ease-in-out ${
                index === current
                  ? 'relative pointer-events-auto opacity-100'
                  : 'absolute inset-x-0 top-0 pointer-events-none opacity-0'
              }`}
            >
              <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
                <h1 className="max-w-4xl text-balance text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.headline}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/86 md:text-lg">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={buildIntentLeadUrl("corporate_training_request")}
                    data-measurement-id="home_hero_corporate_cta"
                    data-testid="page.home.hero.cta.corporate-training"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90"
                  >
                    {primaryCtaLabel}
                  </Link>
                  <Link
                    href="/egitimler"
                    data-measurement-id="home_hero_catalog_cta"
                    data-testid="page.home.hero.cta.catalog"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {secondaryCtaLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={slideNavLabels[index] ?? `${index + 1}. slayta git`}
              className={`h-2.5 w-2.5 rounded-full border-0 p-0 cursor-pointer transition-colors duration-300 ${
                index === current ? 'bg-white' : 'bg-white/35'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
