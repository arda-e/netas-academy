import {
  ContentPageShell,
  EventListLoading,
  FilterPillsLoading,
  SortButtonLoading,
} from "@/components/content";

export default function EtkinliklerLoading() {
  return (
    <ContentPageShell
      hero={{
        gradientVariant: "events",
        title: "Etkinlikler",
        description: (
          <p>
            <strong className="text-white">
              Yaklaşan buluşmaları, webinarları ve özel oturumları
            </strong>{" "}
            takip edin; <span className="hidden sm:inline"><br /></span>
            katılım için gerekli detaylara tek ekrandan ulaşın.
          </p>
        ),
      }}
      testId="page.etkinlikler"
    >
      <div className="mt-2 mb-6 flex flex-col gap-3 sm:mt-4 sm:mb-8 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <FilterPillsLoading count={3} testId="loading.etkinlikler.filters" />
        <SortButtonLoading testId="loading.etkinlikler.sort" />
      </div>

      <div data-testid="loading.etkinlikler">
        <EventListLoading />
      </div>
    </ContentPageShell>
  );
}
