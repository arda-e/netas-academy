import { ContentPageShell, CourseListLoading } from "@/components/content";

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
      <div data-testid="loading.egitimler">
        <CourseListLoading />
      </div>
    </ContentPageShell>
  );
}
