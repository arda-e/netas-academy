import type { Metadata } from "next";
import Link from "next/link";

import { ContentPageShell, VisualStorySection } from "@/components/content";
import { TeacherCarousel } from "@/components/teacher-carousel";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { hakkimizdaVisualSection } from "@/lib/page-visual-sections";
import { getStrapiMediaAltText, getStrapiMediaUrl, getTeachers } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hakkımızda | Netas Academy",
  description:
    "Netaş Academy'nin vizyonunu, eğitim yaklaşımını ve tecrübeli eğitmen kadrosunu keşfedin.",
};

const sections = [
  {
    title: "Eğitimde Fark Yaratıyoruz!",
    body: "Eğitim dünyasında yeni bir anlayışın öncüsü olma vizyonuyla yola çıkan Netaş Academy, katılımcılarına sadece bilgi sunmakla kalmıyor; aynı zamanda onların profesyonel gelişimlerine değer katan bir öğrenim deneyimi de sunuyor. Alanında yetkin ve tecrübeli eğitmen kadromuz, yılların birikimiyle şekillenen eğitim içerikleriyle katılımcılarına sektörel bilgi ve pratik beceri kazandırmayı hedefliyor.",
  },
  {
    title: "Tecrübeli Eğitmen Kadrosu",
    body: "Eğitmenlerimiz, akademik alandaki güçlü altyapılarının yanı sıra, sahada edindikleri sektörel tecrübelerle de öne çıkıyor. Eğitmen kadromuzun gerçek iş dünyasından örneklerle zenginleştirilmiş anlatımları, katılımcılara çok yönlü bir bakış açısı sunuyor. Bu sayede katılımcılar, edindikleri teorik bilgiyi gerçek çalışma ortamlarında kolaylıkla uygulayabilecek yetkinliğe kavuşuyor.",
  },
  {
    title: "Uygulamalı ve İnteraktif Eğitim Modeli",
    body: "Katılımcının sürece aktif biçimde dahil olduğu bu eğitim modeli; vaka analizleri, senaryo temelli çalışmalar ve uygulamalı aktiviteler aracılığıyla, öğrenilen bilginin hızlıca hayata geçirilmesini amaçlıyor.",
  },
  {
    title: "Çeşitlilikten Beslenen İçerik",
    body: "Farklı sektörlerin ihtiyaçları dikkate alınarak tasarlanan eğitim programlarımız, katılımcı profiline göre özelleştirilmiş içerikleriyle yalnızca mevcut uzmanlık alanlarına değil, diğer sektörlerde de uygulanabilir bilgiler edinme fırsatı sunuyor.",
  },
];

export default async function HakkimizdaPage() {
  const teachers = await getTeachers();

  return (
    <ContentPageShell
      eyebrow="Hakkımızda"
      title="Bir Netaş markası olan Netaş Academy, ilham verici yolculuğuna başladı!"
      description={
        <>
          <p>
            Katılımcılarına bilgi, deneyim ve uygulama odaklı bir öğrenim
            yolculuğu sunan Netaş Academy; profesyonel gelişimi destekleyen,
            sektörle güçlü bağ kuran bir eğitim yaklaşımı benimsiyor.
          </p>
        </>
      }
    >
      <div className="space-y-12 sm:space-y-16">
        <div className="grid gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.65fr)] xl:items-start xl:gap-10">
          <aside className="panel-surface rounded-sm p-4 sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
              Yaklaşımımız
            </p>
            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-foreground/80 sm:mt-5 sm:space-y-4 sm:text-base sm:leading-8">
              <li>Bilgiyi profesyonel gelişime dönüştüren içerikler</li>
              <li>Akademik temeli güçlü, sektör deneyimi yüksek eğitmenler</li>
              <li>Vaka ve senaryo tabanlı uygulamalı öğrenme modeli</li>
              <li>Farklı sektörlere uyarlanabilen esnek program yapısı</li>
            </ul>
          </aside>

          <div className="grid gap-4 sm:gap-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="panel-surface rounded-sm p-5 sm:p-8"
              >
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <VisualStorySection {...hakkimizdaVisualSection} />

        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Egitmenlerimiz
          </h2>
          <p className="max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8">
            Farkli uzmanlik alanlarindan gelen egitmen kadromuzu yakindan taniyin.
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

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Link
            href={buildIntentLeadUrl("instructor_application")}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
          >
            Egitmen Basvurusu Yap
          </Link>
          <Link
            href={buildIntentLeadUrl("solution_partner_application")}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
          >
            Cozum Ortakligi Basvurusu
          </Link>
        </div>
      </div>
    </ContentPageShell>
  );
}
