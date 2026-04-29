import type { Metadata } from "next";
import Link from "next/link";

import { ContentPageShell, VisualStorySection } from "@/components/content";
import { CourseCarousel } from "@/components/course-carousel";
import { TeacherCarousel } from "@/components/teacher-carousel";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { hakkimizdaVisualSection } from "@/lib/page-visual-sections";
import { getLatestCourses, getStrapiMediaAltText, getStrapiMediaUrl, getTeachers } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda | Netas Academy",
  description:
    "Netaş teknoloji ve sektör deneyimiyle şekillenen, vaka ve senaryo tabanlı uygulamalı eğitim modelimizi, kurum ihtiyacına göre esnek program yapımızı ve saha deneyimi güçlü eğitmen kadromuzu keşfedin.",
};

export default async function HakkimizdaPage() {
  const teachers = await getTeachers();
  const courses = await getLatestCourses(5);

  return (
    <ContentPageShell
      eyebrow="Hakkımızda"
      title="Netaş Academy: Uygulamalı Eğitim Deneyimiyle Kurumsal Gelişimde Fark Yaratıyoruz"
      description={
        <>
          <p>
            Netaş teknoloji ve sektör deneyimiyle şekillenen Netaş Academy,
            kurumların gelişim ihtiyaçlarına yanıt veren uygulamalı eğitim
            çözümleri sunar. Vaka, senaryo ve gerçek iş problemleri üzerinden
            yapılandırılmış programlarla katılımcıların yetkinliklerini
            bir üst seviyeye taşımayı hedefliyoruz.
          </p>
        </>
      }
    >
      <div className="space-y-10 sm:space-y-14">
        {/* B — Netaş Trust */}
        <section className="panel-surface rounded-sm p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Netaş Güvencesiyle Kurumsal Eğitim
          </h2>
          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
            Netaş Academy, Netaş&rsquo;ın derin teknoloji ve sektör deneyiminden güç
            alır. Köklü geçmişin getirdiği bilgi birikimi, eğitim
            programlarımızın sağlam bir temele oturmasını sağlar. Kurumlara
            özel, ölçeklenebilir ve sahada karşılığı olan eğitim çözümleri
            üretiyoruz.
          </p>
        </section>

        {/* C — Applied Learning Model */}
        <section className="panel-surface rounded-sm p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Vaka, Senaryo ve Gerçek İş Problemine Dayalı Eğitim Modeli
          </h2>
          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
            Eğitim modelimiz, katılımcıların teorik bilgiyi ezberlemek yerine
            gerçek iş problemleri, vaka analizleri ve senaryo temelli
            çalışmalarla içselleştirmesine odaklanır. Etkileşimli
            uygulamalar, grup çalışmaları ve yansıtma oturumları sayesinde
            öğrenme süreci kalıcı hale gelir. Her oturum, katılımcının kendi
            iş bağlamına doğrudan taşıyabileceği araçlar ve yöntemler sunar.
          </p>
        </section>

        {/* D — Institution-Shaped Programs */}
        <section className="panel-surface rounded-sm p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Kurum İhtiyacına Göre Şekillenen Programlar
          </h2>
          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
            Her kurumun ihtiyacı farklıdır. Eğitim programlarımız; sektör,
            ekip profili, mevcut yetkinlik düzeyi ve hedeflenen gelişim
            alanları doğrultusunda esnek biçimde şekillenir. Açık sınıf
            eğitimlerinden kapalı devre kurumsal programlara, hibrit
            modellerden tamamen uzaktan yapılandırmalara kadar her formatta
            çözüm sunabiliyoruz.
          </p>
        </section>

        {/* Visual Story Section — reinforces learning model visually */}
        <VisualStorySection {...hakkimizdaVisualSection} />

        {/* E — Instructors */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Saha Deneyimi Güçlü Eğitmen Kadromuz
          </h2>
          <p className="max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8">
            Eğitmenlerimiz yalnızca anlatıcı değil, saha deneyimi olan ve
            dönüşüm projelerinde yer almış uzmanlardır. Katılımcılara
            rehberlik ederken kendi tecrübelerinden somut örnekler sunar,
            kuramla pratik arasındaki köprüyü birlikte kurar.
          </p>
          <TeacherCarousel
            items={teachers.map((teacher) => ({
              id: teacher.documentId,
              slug: teacher.slug,
              name: teacher.fullName,
              imageUrl: getStrapiMediaUrl(teacher.profilePhoto),
              imageAlt: getStrapiMediaAltText(teacher.profilePhoto) ?? teacher.fullName,
            }))}
          />
        </div>

        {/* F — Participant Outcomes */}
        <section className="panel-surface rounded-sm p-5 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Katılımcı Çıktısı: Teoriyi İşe Taşıma ve Pratik Beceri
          </h2>
          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
            Eğitimlerimizin nihai hedefi, katılımcıların edindiği bilgiyi iş
            ortamına hızla taşıyabilmesidir. Program sonunda katılımcılar:
            yeni bakış açıları kazanır, uygulanabilir yöntemler öğrenir,
            pratik becerilerini geliştirir ve kurum içinde fark yaratacak
            donanıma ulaşır. Öğrenmenin ölçülebilir iş sonuçlarına
            dönüşmesini hedefliyoruz.
          </p>
        </section>

        {/* G — Latest Courses Preview */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Eğitim Programlarımızdan Öne Çıkanlar
          </h2>
          <p className="max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8">
            En güncel eğitim programlarımızı keşfedin. Her program, sahada
            kanıtlanmış yöntemlerle kurumların dönüşüm ihtiyaçlarına yanıt
            verecek şekilde yapılandırılmıştır.
          </p>
          <CourseCarousel
            items={courses.map((course) => ({
              documentId: course.documentId,
              slug: course.slug,
              title: course.title,
              summary: course.summary,
              topicArea: course.topicArea,
              level: course.level,
            }))}
          />
        </div>

        {/* H — CTAs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Link
            href={buildIntentLeadUrl("corporate_training_request")}
            data-measurement-id="about_corporate_cta"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#ffb933] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#e5a72e]"
          >
            Kurumsal Eğitim Talebi
          </Link>
          <Link
            href="/egitimler"
            data-measurement-id="about_education_cta"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
          >
            Eğitimleri İncele
          </Link>
        </div>
      </div>
    </ContentPageShell>
  );
}
