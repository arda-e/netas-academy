"use client";

import { useTranslations } from "next-intl";

import { HorizontalScrollCarousel } from "@/components/carousel/horizontal-scroll-carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";

export type TeacherCarouselItem = {
  id: number | string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

type TeacherCarouselProps = {
  items: TeacherCarouselItem[];
  carousel?: {
    className?: string;
    emptyMessage?: string;
    cardTestIdPrefix?: string;
    controls?: {
      prevButtonTestId?: string;
      nextButtonTestId?: string;
    };
  };
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TeacherCarousel({
  items,
  carousel,
}: TeacherCarouselProps) {
  const {
    className,
    emptyMessage = "Gosterilecek egitmen bulunamadi.",
    cardTestIdPrefix,
    controls = {},
  } = carousel ?? {};
  const t = useTranslations("common");

  return (
    <HorizontalScrollCarousel
      content={{
        itemsCount: items.length,
        emptyMessage,
        children: (
          <>
            {items.map((teacher) => (
              <Link
                key={teacher.id}
                href={`/egitmenler/${teacher.slug}`}
                className="panel-surface group/card-link min-w-[220px] snap-start cursor-pointer rounded-sm p-5 transition-all hover:-translate-y-0.5 hover:border-[#009ca6] hover:shadow-sm sm:min-w-[250px]"
                data-testid={
                  cardTestIdPrefix ? `${cardTestIdPrefix}.${teacher.slug}` : undefined
                }
              >
                <Avatar className="size-24 ring-1 ring-border/60">
                  <AvatarImage
                    src={teacher.imageUrl ?? undefined}
                    alt={teacher.imageAlt ?? teacher.name}
                  />
                  <AvatarFallback className="bg-muted/70 text-lg font-semibold text-foreground">
                    {getInitials(teacher.name)}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6]">
                  {teacher.name}
                </p>
                <p className="mt-1 text-sm text-foreground/62 transition-colors group-hover/card-link:text-[#009ca6]">
                  Profili goruntule
                </p>
              </Link>
            ))}
          </>
        ),
      }}
      controls={{
        prevLabel: t("teacher_carousel.prev"),
        nextLabel: t("teacher_carousel.next"),
        prevButtonTestId: controls.prevButtonTestId,
        nextButtonTestId: controls.nextButtonTestId,
      }}
      layout={{
        className: className ? `space-y-5 ${className}` : "space-y-5",
        scrollAreaClassName:
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        controlsClassName: "justify-end gap-2",
        controlsPlacement: "before",
      }}
    />
  );
}
