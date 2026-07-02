import {
  CardListLoading,
  ContentPageShell,
  HeroDescriptionLoading,
  SearchFieldLoading,
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
          <CardListLoading columns={4} />
        </div>
      </div>
    </ContentPageShell>
  );
}
