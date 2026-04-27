import { ContentPageShell, CourseList, VisualStorySection } from "@/components/content";
import { egitimlerVisualSection } from "@/lib/page-visual-sections";
import { getCourses } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export default async function EgitimlerPage() {
  const courses = await getCourses();

  return (
    <ContentPageShell
      title="Eğitimler"
      description={
        <>
          <p>
            <strong className="text-white">
              Uzman eğitmenler tarafından hazırlanan programları
            </strong>{" "}
            inceleyin ve kurumunuz için en uygun öğrenme yolculuğunu planlayın.
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-white/88 sm:gap-2 sm:text-sm">
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Kurumsal programlar
            </span>
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Canlı oturumlar
            </span>
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Uygulamalı öğrenme
            </span>
          </div>
        </>
      }
    >
      <div className="space-y-10 sm:space-y-12">
        <section className="grid gap-4 md:grid-cols-3 md:gap-5">
          <article className="panel-surface rounded-sm p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/72">
              Kurumsal Uyum
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Eğitimleri kurum ihtiyaçlarına göre değerlendirin.
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
              Programları yalnızca konu başlığıyla değil, ekiplerinize sağlayacağı
              uygulama değeri ve kurumsal uyarlanabilirlik açısından inceleyin.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/72">
              Uzman Eğitmen
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Program yaklaşımını eğitmen perspektifiyle görün.
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
              Her eğitim kartında eğitmen bilgisini görünür tutarak içerik ile uzmanlık
              arasında daha net bir karar hattı kuruyoruz.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/72">
              Uygulamalı Kazanım
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Öğrenme çıktısını daha erken görün.
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
              Detay sayfaları yalnızca açıklama alanı değil, ekibiniz için nasıl bir
              öğrenme değeri üretileceğini anlamayı kolaylaştıran karar yüzeyleri olmalı.
            </p>
          </article>
        </section>

        <section className="panel-surface rounded-sm p-5 sm:p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-start">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-primary/72">
                Eğitim Yaklaşımı
              </p>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Katalog değil, kurumsal öğrenme kararı vermeyi kolaylaştıran bir yüzey.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
                Bu sayfa eğitimleri yalnızca listelemek için değil, ekibinizin ihtiyaçlarına
                en yakın programı daha hızlı ayırt edebilmeniz için kurgulanır. Program
                özetleri, eğitmen odağı ve detay sayfası akışı birlikte çalışarak ilk karar
                adımını kolaylaştırır.
              </p>
            </div>

            <div className="space-y-3 rounded-sm border border-white/8 bg-white/4 p-4 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/72">
                Ne Beklemelisiniz?
              </p>
              <ul className="space-y-2 text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
                <li>Programın odağını hızlı anlama</li>
                <li>Eğitmen perspektifini görme</li>
                <li>Detay sayfasından kurumsal talebe ilerleme</li>
              </ul>
            </div>
          </div>
        </section>

        <CourseList
          items={courses.map((course) => ({
            id: course.documentId,
            slug: course.slug,
            title: course.title,
            summary: course.summary,
            teacherName: course.teacher?.fullName ?? null,
          }))}
        />

        <VisualStorySection {...egitimlerVisualSection} />
      </div>
    </ContentPageShell>
  );
}
