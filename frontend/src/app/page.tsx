import { HeroOverlay } from "@/components/hero-overlay";
import { VisualStorySection } from "@/components/content";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { homeVisualSection } from "@/lib/page-visual-sections";

export default function Home() {
  return (
    <>
      <HeroOverlay
        title={
          <>
            Ekiplerinizi dönüşüm ve adaptasyon
            <br className="hidden sm:block" />
            yolculuğunda
            <br className="hidden sm:block" />
            <span className="text-[#ffb933]">bir adım öne</span> taşıyın.
          </>
        }
        description="Teknoloji ve iş yapış biçimleri hızla değişiyor. Kurumların rekabet avantajını koruyabilmesi, ekiplerini bu değişime hazır hale getirmesine bağlı. Netaş Akademi, onlarca yıllık sektör tecrübesini kurumsal öğrenme programlarına dönüştürerek dönüşüm yolculuğunuzda yanınızda olur."
        primaryCta={{ href: buildIntentLeadUrl("corporate_training_request"), label: "Kurumsal Eğitim Talep Et" }}
        secondaryCta={{ href: "/egitimler", label: "Eğitimleri İncele" }}
        primaryCtaMeasurementId="home-hero-primary"
        secondaryCtaMeasurementId="home-hero-secondary"
      />

      <main className="page-shell">
        <section className="page-section pt-8 sm:pt-10 lg:pt-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/72">
              Netaş Akademi
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Netaş’ın köklü teknoloji birikimiyle
              <br />
              şekillenen bir öğrenme platformu.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-foreground/72 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
              Netaş Akademi, kurumların değişen dünyaya uyum sağlaması için
              ihtiyaç duyduğu bilgi ve becerileri, sahada kanıtlanmış
              yöntemlerle sunar. Amacımız, ekiplerinizin potansiyelini ortaya
              çıkarmak ve dönüşüm projelerinde somut fark yaratmalarını
              sağlamaktır.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
              <li className="panel-surface rounded-sm p-5 text-left sm:p-6">
                <p className="text-sm font-semibold text-foreground">Sahada Kanıtlanmış</p>
                <p className="mt-2 text-sm leading-6 text-foreground/68">
                  Yılların sektör deneyimiyle oluşturulmuş, teoriden pratiğe uzanan eğitim içerikleri.
                </p>
              </li>
              <li className="panel-surface rounded-sm p-5 text-left sm:p-6">
                <p className="text-sm font-semibold text-foreground">Kuruma Özel</p>
                <p className="mt-2 text-sm leading-6 text-foreground/68">
                  Her kurumun ihtiyacına göre şekillenen esnek program yapısı ve özelleştirilebilir içerikler.
                </p>
              </li>
              <li className="panel-surface rounded-sm p-5 text-left sm:p-6">
                <p className="text-sm font-semibold text-foreground">Dönüşüm Odaklı</p>
                <p className="mt-2 text-sm leading-6 text-foreground/68">
                  Bireysel öğrenmenin ötesinde, takım dinamiklerini güçlendiren ve iş birliğini artıran programlar.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <div className="page-section pt-8 sm:pt-10 lg:pt-12">
          <VisualStorySection {...homeVisualSection} />
        </div>
      </main>
    </>
  );
}
