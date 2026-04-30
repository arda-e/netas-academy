import { ContentPageShell, NewsList } from "@/components/content";

export default function HaberlerPage() {
  return (
    <ContentPageShell
      testId="page.haberler"
      title="Haberler"
      description={
        <p>
          Akademi gundemini, yeni duyurulari ve one cikan gelismeleri takip
          edebileceginiz kurumsal haber alani.
        </p>
      }
    >
      <NewsList items={[]} />
    </ContentPageShell>
  );
}
