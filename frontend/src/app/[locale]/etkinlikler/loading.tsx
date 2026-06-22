import { ContentPageShell, EventListLoading } from "@/components/content";

export default function EtkinliklerLoading() {
  return (
    <ContentPageShell
      hero={{
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
      <div data-testid="loading.etkinlikler">
        <EventListLoading />
      </div>
    </ContentPageShell>
  );
}
