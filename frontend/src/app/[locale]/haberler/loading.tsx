import { CardListLoading, ContentPageShell } from "@/components/content";

export default function HaberlerLoading() {
  return (
    <ContentPageShell
      testId="page.haberler"
      hero={{
        gradientVariant: "news",
        title: "Haberler",
        description: (
          <p>
            Güncel duyurular, basın görünürlüğü ve kurum haberlerini tek
            akışta keşfedin.
          </p>
        ),
      }}
    >
      <CardListLoading columns={2} testId="loading.haberler" />
    </ContentPageShell>
  );
}
