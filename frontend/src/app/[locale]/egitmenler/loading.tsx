import { ContentPageShell, TeacherListLoading } from "@/components/content";
import { getTranslations } from "next-intl/server";

export default async function EgitmenlerLoading() {
  const t = await getTranslations("teachers");

  return (
    <ContentPageShell
      testId="page.egitmenler"
      title={t("hero.title")}
      descriptionClassName="max-w-3xl text-balance"
      description={
        <p>
          <strong className="text-white">{t("hero.description_strong")}</strong>{" "}
          {t("hero.description_rest")}
        </p>
      }
    >
      <div data-testid="loading.egitmenler">
        <TeacherListLoading />
      </div>
    </ContentPageShell>
  );
}
