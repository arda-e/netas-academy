import {
  ContentPageShell,
  HeroDescriptionLoading,
  SearchFieldLoading,
  TeacherListLoading,
} from "@/components/content";

export default function EgitmenlerLoading() {
  return (
    <ContentPageShell
      testId="page.egitmenler"
      hero={{
        gradientVariant: "teachers",
        title: "Eğitmenler",
        descriptionClassName: "max-w-3xl text-balance",
        description: <HeroDescriptionLoading testId="loading.egitmenler.hero-description" />,
      }}
    >
      <div className="space-y-4 sm:space-y-8">
        <SearchFieldLoading
          expandedWidthClassName="lg:w-[560px]"
          testId="loading.egitmenler.search"
        />
        <div data-testid="loading.egitmenler">
          <TeacherListLoading />
        </div>
      </div>
    </ContentPageShell>
  );
}
