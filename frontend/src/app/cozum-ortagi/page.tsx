import type { Metadata } from "next";
import Link from "next/link";

import { ContentPageShell } from "@/components/content";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { join, normalizeKey } from "@/lib/testids";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Çözüm Ortağı | Netaş Academy",
  description:
    "Netaş Academy ile eğitim, danışmanlık, workshop ve sektörel uzmanlık alanlarında çözüm ortaklığı yapmak için başvurun.",
};

const collaborationAreas = [
  {
    title: "Eğitim Programları",
    body: "Kurumların ihtiyaçlarına göre şekillendirilen açık ve kapalı devre eğitim programlarının tasarımı ve uygulanması süreçlerinde iş birliği yapabiliriz.",
  },
  {
    title: "Danışmanlık Hizmetleri",
    body: "Kurumsal gelişim, organizasyonel dönüşüm ve insan kaynakları stratejileri alanlarında danışmanlık hizmetlerini birlikte yürütebiliriz.",
  },
  {
    title: "Workshop ve Fasilitasyon",
    body: "Takım çalıştayları, strateji atölyeleri ve yaratıcı problem çözme oturumlarının fasilitasyonu konusunda ortak çalışmalar gerçekleştirebiliriz.",
  },
  {
    title: "Sektörel / Konu Bazlı Uzmanlık",
    body: "Belirli bir sektör veya konu alanındaki derin uzmanlığınızı Netaş Academy çatısı altında eğitim ve içerik programlarına dönüştürebiliriz.",
  },
];

export default async function CozumOrtagiPage() {
  return (
    <ContentPageShell
      testId="page.cozum-ortagi"
      eyebrow="Çözüm Ortaklığı"
      title="Eğitim ve danışmanlık alanında birlikte yeni değer üretelim."
      description={
        <>
          <p>
            Netaş Academy olarak eğitim ve danışmanlık ekosisteminde birlikte
            çalışabileceğimiz çözüm ortakları arıyoruz. Uzmanlığınızı
            programlarımıza taşıyarak daha geniş kitlelere ulaşmanız için
            destek olmaya hazırız.
          </p>
        </>
      }
    >
      <div className="space-y-12 sm:space-y-16">
        <div className="grid gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.65fr)] xl:items-start xl:gap-10">
          <aside className="panel-surface rounded-sm p-4 sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
              Hangi Alanlarda Çözüm Ortaklığı Yapabiliriz
            </p>
            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-foreground/80 sm:mt-5 sm:space-y-4 sm:text-base sm:leading-8">
              <li>Eğitim programları</li>
              <li>Danışmanlık hizmetleri</li>
              <li>Workshop ve fasilitasyon</li>
              <li>Sektörel / konu bazlı uzmanlık</li>
            </ul>
          </aside>

          <div className="grid gap-4 sm:gap-6">
            {collaborationAreas.map((area) => (
              <article
                key={area.title}
                className="panel-surface rounded-sm p-5 sm:p-8"
                data-testid={join('page', 'cozum-ortagi', 'area-card', normalizeKey(area.title))}
              >
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {area.title}
                </h2>
                <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
                  {area.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Başvurunuzu İnceleyelim
          </h2>
          <p className="max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8">
            Eğitim, danışmanlık, workshop veya sektörel uzmanlık alanlarında
            Netaş Academy ile olası iş birliği fikrinizi bizimle
            paylaşabilirsiniz.
          </p>
          <Link
            href={buildIntentLeadUrl("solution_partner_application")}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
            data-testid="page.cozum-ortagi.cta.apply"
          >
            Çözüm Ortağı Başvurusu
          </Link>
        </div>
      </div>
    </ContentPageShell>
  );
}
