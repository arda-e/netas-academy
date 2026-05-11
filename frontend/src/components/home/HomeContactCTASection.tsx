import Link from 'next/link';
import { buildIntentLeadUrl } from '@/lib/lead-intents';

export function HomeContactCTASection() {
  return (
    <section className="w-full h-[400px] bg-gradient-to-br from-slate-950 via-primary to-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-normal text-white leading-snug max-w-2xl">
        İhtiyacınıza uygun eğitim yolculuğunu birlikte kuralım
      </h2>
      <p className="mt-4 text-white/60 text-base leading-relaxed max-w-xl">
        Ekibinizin hedeflerini ve gelişim önceliklerini paylaşın; size özel
        bir kurumsal eğitim programı tasarlayalım.
      </p>
      <Link
        href={buildIntentLeadUrl("corporate_training_request")}
        data-measurement-id="home_contact_cta"
        data-testid="page.home.cta.contact"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90"
      >
        Kurumsal Eğitim Talep Et
      </Link>
    </section>
  );
}
