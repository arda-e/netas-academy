import { ContentPageShell, CourseListLoading, TeacherListLoading } from "@/components/content";

export default function HakkimizdaLoading() {
  return (
    <ContentPageShell
      testId="page.hakkimizda"
      eyebrow="Hakkımızda"
      title="Netaş Academy: Uygulamalı Eğitim Deneyimiyle Kurumsal Gelişimde Fark Yaratıyoruz"
      description={
        <p>
          Netaş teknoloji ve sektör deneyimiyle şekillenen Netaş Academy,
          kurumların gelişim ihtiyaçlarına yanıt veren uygulamalı eğitim
          çözümleri sunar. Vaka, senaryo ve gerçek iş problemleri üzerinden
          yapılandırılmış programlarla katılımcıların yetkinliklerini
          bir üst seviyeye taşımayı hedefliyoruz.
        </p>
      }
    >
      <div className="space-y-10 sm:space-y-14" data-testid="loading.hakkimizda">
        <TeacherListLoading />
        <CourseListLoading />
      </div>
    </ContentPageShell>
  );
}
