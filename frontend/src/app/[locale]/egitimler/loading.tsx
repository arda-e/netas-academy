import {
  CardListLoading,
  ContentPageShell,
  FilterPillsLoading,
  HeroDescriptionWithTrailingLoading,
  SearchFieldLoading,
} from "@/components/content";

export default function EgitimlerLoading() {
  return (
    <ContentPageShell
      testId="page.egitimler"
      hero={{
        gradientVariant: "courses",
        title: "Eğitim Kataloğu",
        description: <HeroDescriptionWithTrailingLoading descriptionTestId="loading.egitimler.hero-description" />,
      }}
    >
      <div className="space-y-10 sm:space-y-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <SearchFieldLoading testId="loading.egitimler.search" />
          <FilterPillsLoading count={6} testId="loading.egitimler.filters" />
        </div>

        <div data-testid="loading.egitimler">
          <CardListLoading columns={3} />
        </div>
      </div>
    </ContentPageShell>
  );
}
