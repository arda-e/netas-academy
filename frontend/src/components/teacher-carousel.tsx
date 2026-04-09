"use client";

import { useRef } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TeacherCarouselItem = {
  id: number | string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

type TeacherCarouselProps = {
  items: TeacherCarouselItem[];
  className?: string;
  emptyMessage?: string;
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
  className,
  emptyMessage = "Gosterilecek egitmen bulunamadi.",
}: TeacherCarouselProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const scrollByPage = (direction: "left" | "right") => {
    const node = scrollAreaRef.current;

    if (!node) {
      return;
    }

    const amount = Math.max(node.clientWidth * 0.8, 320);
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (items.length === 0) {
    return (
      <div className="panel-surface rounded-sm px-6 py-10 text-center text-foreground/68">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Onceki egitmenler"
          onClick={() => scrollByPage("left")}
        >
          <CaretLeft className="size-4" weight="bold" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Sonraki egitmenler"
          onClick={() => scrollByPage("right")}
        >
          <CaretRight className="size-4" weight="bold" />
        </Button>
      </div>

      <div
        ref={scrollAreaRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((teacher) => (
          <Link
            key={teacher.id}
            href={`/egitmenler/${teacher.slug}`}
            className="panel-surface group min-w-[220px] snap-start rounded-sm p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_58px_rgba(0,0,0,0.32)] sm:min-w-[250px]"
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
            <p className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-foreground">
              {teacher.name}
            </p>
            <p className="mt-1 text-sm text-foreground/62">
              Profili goruntule
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
