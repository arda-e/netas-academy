import { ContentPageShell, TeacherListLoading } from "@/components/content";

export default function EgitmenlerLoading() {
  return (
    <ContentPageShell
      testId="page.egitmenler"
      hero={{
        gradientVariant: "teachers",
        title: "Eğitmenler",
        descriptionClassName: "max-w-3xl text-balance",
      }}
    >
      <div data-testid="loading.egitmenler">
        <TeacherListLoading />
      </div>
    </ContentPageShell>
  );
}
