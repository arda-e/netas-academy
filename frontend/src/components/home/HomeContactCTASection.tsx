import Image from 'next/image';
import heroCtaImage from '@/assets/images/hero-blog.webp';
import { Link } from '@/i18n/navigation';
import { getImagePlaceholderProps, type ImageSource } from '@/lib/image-sources';
import { buildIntentLeadUrl } from '@/lib/lead-intents';

type HomeContactCTASectionProps = {
  heading?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageUrl?: ImageSource | null;
  imageAlt?: string;
};

export function HomeContactCTASection({
  heading = 'İhtiyacınıza uygun eğitim yolculuğunu birlikte kuralım',
  body = 'Ekibinizin hedeflerini ve gelişim önceliklerini paylaşın; size özel bir kurumsal eğitim programı tasarlayalım.',
  buttonLabel = 'Kurumsal Eğitim Talep Et',
  buttonHref = buildIntentLeadUrl("corporate_training_request"),
  imageUrl = heroCtaImage,
  imageAlt = '',
}: HomeContactCTASectionProps = {}) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-950 via-primary to-slate-950 min-h-[240px] sm:min-h-[280px] lg:min-h-[340px]">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover object-center"
          {...getImagePlaceholderProps(imageUrl)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/42 to-slate-950/20" />

      <div className="relative z-10 flex min-h-[240px] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[280px] lg:min-h-[340px]">
        <div className="max-w-2xl px-5 py-6 sm:px-8 sm:py-8">
          <h2 className="text-3xl font-normal leading-snug text-white md:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/90">
            {body}
          </p>
          <Link
            href={buttonHref}
            data-measurement-id="home_contact_cta"
            data-testid="page.home.cta.contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
