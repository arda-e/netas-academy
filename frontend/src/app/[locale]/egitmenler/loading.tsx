import { ContentPageShell, TeacherListLoading } from "@/components/content";

export default function EgitmenlerLoading() {
  return (
    <ContentPageShell
      testId="page.egitmenler"
      title="Eğitmenlerimiz"
      descriptionClassName="max-w-3xl text-balance"
      description={
        <p>
          <strong className="text-white">Alanında uzman eğitmen kadromuzla</strong>{" "}
          tanışın. Her biri saha deneyimini sınıfa taşıyan, sektörün önde gelen
          profesyonellerinden oluşan ekibimizle öğrenme yolculuğunuza yön verin.
        </p>
      }
    >
      <div data-testid="loading.egitmenler">
        <TeacherListLoading />
      </div>
    </ContentPageShell>
  );
}
