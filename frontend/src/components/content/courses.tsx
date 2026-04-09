import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { ContentGrid } from "@/components/content/content-grid";

type CourseListItem = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  teacherName?: string | null;
};

type CourseListProps = {
  items: CourseListItem[];
  emptyMessage?: string;
};

type CourseDetailProps = {
  eyebrow?: string;
  title: string;
  summary?: string | null;
  children: ReactNode;
  afterContent?: ReactNode;
};

export function CourseList({
  items,
  emptyMessage = "Gosterilecek egitim verisi su an kullanilabilir degil.",
}: CourseListProps) {
  return (
    <ContentGrid itemsCount={items.length} emptyMessage={emptyMessage} columnsClassName="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((course) => (
        <ContentCardShell
          key={course.id}
          href={`/egitimler/${course.slug}`}
          title={course.title}
          kicker={course.teacherName ?? "Ogretmen atanacak"}
          summary={course.summary ?? "Bu kurs icin ozet yakinda eklenecek."}
        />
      ))}
    </ContentGrid>
  );
}

export function CourseDetail({
  eyebrow,
  title,
  summary,
  children,
  afterContent,
}: CourseDetailProps) {
  return (
    <ContentDetailShell
      eyebrow={eyebrow}
      title={title}
      summary={summary ?? undefined}
      afterContent={afterContent}
    >
      {children}
    </ContentDetailShell>
  );
}
