import {
  ContentPageShell,
  CourseListLoading,
  FilterPillsLoading,
  SearchFieldLoading,
} from "@/components/content";

export default function EgitimlerLoading() {
  return (
    <ContentPageShell
      testId="page.egitimler"
      hero={{
        gradientVariant: "courses",
        title: "Eğitim Kataloğu",
        description: (
          <>
            <p>
              <strong className="text-white">
                Uzman eğitmenlerin hazırladığı programları
              </strong>{" "}
              inceleyin, kurumunuza en uygun öğrenme yolunu seçin.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-white/88 sm:gap-2 sm:text-sm">
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                Kurumsal programlar
              </span>
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                Canlı oturumlar
              </span>
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                Uygulamalı öğrenme
              </span>
            </div>
          </>
        ),
      }}
    >
      <div className="space-y-10 sm:space-y-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <SearchFieldLoading testId="loading.egitimler.search" />
          <FilterPillsLoading count={6} testId="loading.egitimler.filters" />
        </div>

        <div data-testid="loading.egitimler">
          <CourseListLoading />
        </div>
      </div>
    </ContentPageShell>
  );
}
