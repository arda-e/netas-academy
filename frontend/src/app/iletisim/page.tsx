import type { LeadType } from "@/lib/lead-intents";
import { resolveLeadTypeFromQuery } from "@/lib/lead-intents";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { IntentLeadForm } from "@/components/contact/intent-lead-form";

export const dynamic = "force-dynamic";

type IletisimPageProps = {
  searchParams: Promise<{
    intent?: string;
    topic?: string;
  }>;
};

export default async function IletisimPage({ searchParams }: IletisimPageProps) {
  const params = await searchParams;
  const resolvedIntent = resolveLeadTypeFromQuery(params.intent ?? null);
  const initialLeadType: LeadType = resolvedIntent ?? "corporate_training_request";
  const prefilledTopic = params.topic ?? undefined;

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="relative mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-12 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs items={[{ label: "İletişim" }]} />
          </div>
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              İletişim
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              Eğitim kataloğu, etkinlikler ve kurumsal iş birlikleri hakkında bize yazın.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
          <IntentLeadForm initialLeadType={initialLeadType} prefilledTopic={prefilledTopic} />
        </div>
      </section>
    </main>
  );
}
