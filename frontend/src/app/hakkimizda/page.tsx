import type { Metadata } from "next";
import { TeacherCarousel } from "@/components/teacher-carousel";
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
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="max-w-4xl space-y-5">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Bir Netaş markası olan Netaş Academy, ilham verici yolculuğuna başladı!
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/78">
              Katılımcılarına bilgi, deneyim ve uygulama odaklı bir öğrenim
              yolculuğu sunan Netaş Academy; profesyonel gelişimi destekleyen,
              sektörle güçlü bağ kuran bir eğitim yaklaşımı benimsiyor.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-18 md:px-10 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.65fr)] lg:items-start">
          <aside className="panel-surface rounded-sm p-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
              Yaklaşımımız
            </p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-foreground/80">
              <li>Bilgiyi profesyonel gelişime dönüştüren içerikler</li>
              <li>Akademik temeli güçlü, sektör deneyimi yüksek eğitmenler</li>
              <li>Vaka ve senaryo tabanlı uygulamalı öğrenme modeli</li>
              <li>Farklı sektörlere uyarlanabilen esnek program yapısı</li>
            </ul>
          </aside>
        </div>

        <div className="mt-14 grid gap-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="panel-surface rounded-sm p-8"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-foreground/72 md:text-lg">
                {section.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 space-y-5">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Egitmenlerimiz
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-foreground/72">
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
      </section>
    </main>
  );
}
