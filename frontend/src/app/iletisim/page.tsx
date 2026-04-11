import { ContactForm } from "@/components/contact-form";

export default function IletisimPage() {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              İletişim
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              Eğitimler, etkinlikler ve kurumsal iş birlikleri hakkında bize yazın.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.46fr)]">
          <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
            <ContactForm />
          </div>

          <aside className="panel-surface rounded-sm p-6 md:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
              İletişim Süreci
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-foreground/78 md:text-base">
              <p>
                Eğitimler, etkinlikler ve kurumsal iş birlikleri için gönderdiğiniz mesajlar ilgili ekiplerle
                paylaşılır.
              </p>
              <p>
                Talebinizi hızlandırmak için konu başlığında eğitim adı, etkinlik başlığı veya iş birliği detayını
                belirtmeniz yeterlidir.
              </p>
              <p>
                Formu gönderdikten sonra gerektiğinde sizinle e-posta veya telefon üzerinden iletişime geçebiliriz.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
