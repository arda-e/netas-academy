import type { Metadata } from "next";

import kvkkData from "@/data/kvkk.json";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { KvkkBackButton } from "@/components/kvkk-back-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "KVKK | Netas Academy",
  description:
    "Netaş Telekomünikasyon A.Ş. kişisel verilerin korunmasına ilişkin aydınlatma metni.",
};

function getLatestCommitId() {
  return process.env.GIT_COMMIT_SHA?.slice(0, 7) ?? null;
}

export default function KvkkPage() {
  const latestCommitId = getLatestCommitId();
  const { purposeItems, rightsItems } = kvkkData;

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="page.kvkk">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="page-container relative flex min-h-[260px] w-full items-end py-8 sm:min-h-[320px] sm:py-12">
          <div className="absolute left-4 right-4 top-8 flex items-start justify-between sm:left-6 sm:right-6 sm:top-12 lg:left-10 lg:right-10 xl:left-12 xl:right-12">
            <SiteBreadcrumbs items={[{ label: "KVKK" }]} />
            <KvkkBackButton />
          </div>
          <div className="max-w-4xl space-y-4 sm:space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
              KVKK
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl">
              Kişisel verilerin korunmasına ilişkin aydınlatma metni
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-white/78 sm:text-lg sm:leading-8">
              Netaş Telekomünikasyon A.Ş., kişisel verilerinizin hukuka uygun
              olarak toplanması, saklanması ve paylaşılmasını sağlamak ve
              gizliliğinizi korumak amacıyla mümkün olan en üst seviyede güvenlik
              tedbirlerini almaktadır.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="space-y-4 sm:space-y-5">
          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Genel Bilgilendirme
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Amacımız; 6698 sayılı "Kişisel Verilerin Korunması Kanunu"nun 10.
              maddesi gereğince ve sizlerin memnuniyeti doğrultusunda, kişisel
              verilerinizin alınma şekilleri, işlenme amaçları, paylaşılan kişiler,
              hukuki nedenleri ve haklarınız konularında sizi en şeffaf şekilde
              bilgilendirmektir.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              a) Veri Sorumlusu
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("6698 sayılı Kanun")
              uyarınca, kişisel verileriniz; veri sorumlusu olarak Netaş
              Telekomünikasyon A.Ş. ("Netaş") tarafından aşağıda açıklanan kapsamda
              toplanacak ve işlenebilecektir.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              b) Kişisel Verilerin Hangi Amaçla İşleneceği
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Netaş tarafından, müşterileri, çalışanları, potansiyel müşterileri,
              çalışan adayları, iş ortakları ve tedarikçileri gibi taraflardan,
              kimlik bilgisi, iletişim bilgisi, müşteri bilgisi, müşteri işlem
              bilgisi, işlem güvenliği bilgisi, hukuki işlem ve uyum bilgisi ile
              pazarlama satış bilgisi gibi kategorilerde kişisel veri
              toplanabilmektedir.
            </p>
            <div className="mt-5 max-w-5xl space-y-3 sm:mt-6 sm:space-y-4">
              {purposeItems.map((item) => (
                <p
                  key={item}
                  className="text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg"
                >
                  {item}
                </p>
              ))}
            </div>
            <p className="mt-5 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
              amaçlarıyla 6698 sayılı Kanun'un 5. ve 6. maddelerinde belirtilen
              kişisel veri işleme şartları ve amaçları dahilinde işlenecektir.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              c) İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Toplanan kişisel verileriniz; yukarıda belirtilen amaçların
              gerçekleştirilmesi ile sınırlı olmak üzere aşağıdaki taraflara
              aktarılabilecektir:
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-7 text-foreground/72 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
              <li>Netaş'ın iş ortaklarına, hissedarlarına, iştiraklerine,</li>
              <li>
                Vergi Usul Kanunu, Sosyal Güvenlik Kurumu mevzuatı, Sayıştay, Suç
                Gelirlerinin Aklanmasının Önlenmesi Hakkında Kanun, Karaparanın
                Aklanmasının Önlenmesine Dair Kanun, Türk Ticaret Kanunu, Borçlar
                Kanunu ve diğer mevzuat hükümlerinin izin verdiği kişi veya
                kuruluşlara,
              </li>
              <li>Kanunen yetkili kamu kurum ve kuruluşları, idari merciler ve yasal mercilere,</li>
              <li>Yurtdışı şirketlerine ve iştiraklerine,</li>
              <li>Danışmanlar, denetçiler, avukatlar ve hizmet alınan diğer üçüncü kişilere,</li>
              <li>
                Ürün/hizmet karşılaştırma, analiz, değerlendirme, reklam ve yukarıda
                belirtilen amaçların gerçekleştirilmesinde hizmet aldığımız,
                işbirliği yaptığımız gerçek veya tüzel kişilere, program ortağı
                kurum ve kuruluşlara, müşterilerimize gönderdiğimiz iletilerin
                gönderilmesi konusunda anlaşmalı olduğumuz kurumlara, verilen
                siparişlerin size teslimini gerçekleştiren kargo şirketlerine
                6698 sayılı Kanun'un 8. ve 9. maddelerinde belirtilen kişisel veri
                işleme şartları ve amaçları çerçevesinde aktarılabilecektir.
              </li>
            </ul>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              ç) Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Kişisel verileriniz Netaş Genel Müdürlük, anlaşmalı internet siteleri
              üzerinden yapılmış olan başvurular, destek hizmeti verdiğimiz / aldığımız
              sair kurumlar ile her türlü mevzuat veya sözleşme dahilinde işlem
              yapılan gerçek ve/veya tüzel kişiler, bayiler, kısa mesaj ve elektronik
              posta, sesli yanıt sistemi, internet sitemiz ve mobil uygulamamız,
              çağrı merkezlerimiz, sosyal medya hesaplarımız gibi mecralardan sözlü,
              yazılı veya elektronik ortamda veya ileride kurulacak/oluşabilecek
              diğer kanallar başta olmak üzere Netaş tarafından yasal mevzuat
              çerçevesinde yukarıda belirtilen amaçlarla, sözleşmenin ifası dahilinde
              toplanmaktadır.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              d) Kişisel Veri Sahibinin 6698 sayılı Kanun'un 11. Maddesinde Sayılan Hakları
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Kişisel veri sahipleri olarak, haklarınıza ilişkin taleplerinizi
              aşağıda düzenlenen yöntemlerle iletmeniz durumunda Netaş talebin
              niteliğine göre talebi en kısa sürede ve en geç otuz gün içinde
              sonuçlandıracaktır. Verilecek cevapta on sayfaya kadar ücret
              alınmayacaktır. On sayfanın üzerindeki her sayfa için 1 Türk Lirası
              işlem ücreti alınacaktır. Başvuruya cevabın CD, flash bellek gibi bir
              kayıt ortamında verilmesi halinde şirketimiz tarafından talep
              edilebilecek ücret, kayıt ortamının maliyetini geçmeyecektir.
            </p>
            <div className="mt-5 max-w-5xl space-y-3 sm:mt-6">
              {rightsItems.map((item) => (
                <p
                  key={item}
                  className="text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg"
                >
                  {item}
                </p>
              ))}
            </div>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Başvuru Usulü
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Yukarıda belirtilen haklarınızı kullanma ile ilgili talebinizi,
              6698 sayılı Kanun'un 13. maddesinin 1. fıkrası ve 30356 sayılı ve
              10.03.2018 tarihli Veri Sorumlusuna Başvuru Usul ve Esasları
              Hakkında Tebliğ gereğince Türkçe ve yazılı olarak veya kayıtlı
              elektronik posta (KEP) adresi, güvenli elektronik imza, mobil imza
              ya da Netaş'a daha önce bildirilen ve sistemimizde kayıtlı bulunan
              elektronik posta adresini kullanmak suretiyle iletebilirsiniz.
            </p>
            <p className="mt-4 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg">
              Başvurularda sadece başvuru sahibi kişi hakkında bilgi verilecek
              olup diğer aile fertleri ve üçüncü kişiler hakkında bilgi alınması
              mümkün olmayacaktır. Netaş'ın cevap vermeden önce kimliğinizi
              doğrulama hakkı saklıdır.
            </p>
            <p className="mt-4 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg">
              Başvurunuzda adınızın, soyadınızın ve başvuru yazılı ise imzanızın;
              Türkiye Cumhuriyeti vatandaşları için T.C. kimlik numaranızın, yabancı
              iseniz uyruğunuzun, pasaport numaranızın veya varsa kimlik
              numaranızın; tebligata esas yerleşim yeri veya iş yeri adresinizin;
              varsa bildirime esas elektronik posta adresi, telefon ve faks
              numaranızın; talep konunuzun bulunması zorunlu olup varsa konuya
              ilişkin bilgi ve belgelerin de başvuruya eklenmesi gerekmektedir.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              İletişim Bilgileri
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Yazılı olarak yapmak istediğiniz başvurularınızı, gerekli belgeleri
              ekleyerek veri sorumlusu olarak Şirketimizin Yenişehir Mah. Osmanlı
              Bulvarı No:11 34912 adresine verebilirsiniz.
            </p>
            <p className="mt-4 max-w-4xl break-words text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg">
              E-posta yoluyla yapmak istediğiniz başvurularınızı netas@hs02.kep.tr
              KEP adresimize yapabilirsiniz. E-posta yoluyla yapmak istediğiniz
              başvurularınızı kvkk@netas.com.tr e-posta adresine yapabilirsiniz.
            </p>
            <p className="mt-4 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg">
              Talebinizin niteliğine göre kimlik tespitine olanak sağlayacak bilgi
              ve belgelerin eksiksiz ve doğru olarak tarafımıza sağlanması
              gerekmektedir. İstenilen bilgi ve belgelerin gereği gibi sağlanmaması
              durumunda, Netaş tarafından talebinize istinaden yapılacak
              araştırmaların tam ve nitelikli şekilde yürütülmesinde aksaklıklar
              yaşanabilecektir.
            </p>
          </article>

          <article className="panel-surface rounded-sm p-4 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Resmi Netaş Sitesi
            </h2>
            <p className="mt-3 max-w-4xl text-[15px] leading-7 text-foreground/72 sm:mt-4 sm:text-base sm:leading-8 md:text-lg">
              Kurumsal ve hukuki detaylar için resmi Netaş web sitesini
              inceleyebilirsiniz.
            </p>
            <a
              href="https://netas.com.tr/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:mt-6 sm:w-auto sm:self-start"
              data-testid="page.kvkk.external-link.netas"
            >
              Netaş Web Sitesine Git
            </a>
            <p className="mt-5 text-sm text-foreground/56 sm:mt-6">
              Güncel commit ID:{" "}
              <span className="font-mono text-foreground/72" data-testid="page.kvkk.commit-id">
                {latestCommitId ?? "Bilinmiyor"}
              </span>
            </p>
          </article>

          <div className="flex justify-start pt-2">
            <KvkkBackButton />
          </div>
        </div>
      </section>
    </main>
  );
}