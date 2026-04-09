import { ContactForm } from "@/components/contact-form";

export default function IletisimPage() {
  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/88">
              Netas Academy
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              İletişim
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              Eğitimler, etkinlikler ve kurumsal iş birlikleri hakkında bize yazın.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-18 md:px-10 lg:px-12">
        <div className="panel-surface max-w-5xl rounded-sm p-8 md:p-10">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
