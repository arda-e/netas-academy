"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HorizontalScrollCarouselProps = {
  itemsCount: number;
  emptyMessage: string;
  children: ReactNode;
  className?: string;
  scrollAreaClassName?: string;
  controlsClassName?: string;
  controlsPlacement?: "before" | "after";
  prevLabel: string;
  nextLabel: string;
  prevButtonTestId?: string;
  nextButtonTestId?: string;
  scrollAreaTestId?: string;
};

export function HorizontalScrollCarousel({
  itemsCount,
  emptyMessage,
  children,
  className,
  scrollAreaClassName,
  controlsClassName,
  controlsPlacement = "after",
  prevLabel,
  nextLabel,
  prevButtonTestId,
  nextButtonTestId,
  scrollAreaTestId,
}: HorizontalScrollCarouselProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const node = scrollAreaRef.current;
    if (!node) {
      return;
    }

    const updateScrollState = () => {
      const overflow = node.scrollWidth > node.clientWidth + 1;
      setHasOverflow(overflow);

      if (!overflow) {
        setCanScrollPrev(false);
        setCanScrollNext(false);
        return;
      }

      setCanScrollPrev(node.scrollLeft > 0);
      setCanScrollNext(node.scrollLeft + node.clientWidth < node.scrollWidth - 1);
    };

    updateScrollState();

    const onResize = () => updateScrollState();
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", onResize);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;

    observer?.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, [itemsCount]);

  const handleScroll = (direction: "left" | "right") => {
    const node = scrollAreaRef.current;

    if (!node) {
      return;
    }

    const scrollAmount = Math.max(node.clientWidth * 0.8, 320);
    const delta = direction === "left" ? -scrollAmount : scrollAmount;
    node.scrollBy({
      left: delta,
      behavior: "smooth",
    });
  };

  if (itemsCount === 0) {
    return (
      <div className="panel-surface rounded-sm px-6 py-10 text-center text-foreground/68">
        {emptyMessage}
      </div>
    );
  }

  const controls = hasOverflow ? (
    <div
      className={cn("flex items-center gap-1.5", controlsClassName)}
      aria-hidden={!hasOverflow}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label={prevLabel}
        data-testid={prevButtonTestId}
        onClick={() => handleScroll("left")}
        disabled={!canScrollPrev}
      >
        <CaretLeft className="size-4" weight="bold" />
      </Button>

      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label={nextLabel}
        data-testid={nextButtonTestId}
        onClick={() => handleScroll("right")}
        disabled={!canScrollNext}
      >
        <CaretRight className="size-4" weight="bold" />
      </Button>
    </div>
  ) : null;

  return (
    <section className={className}>
      {controlsPlacement === "before" ? controls : null}

      <div
        ref={scrollAreaRef}
        data-testid={scrollAreaTestId}
        className={scrollAreaClassName}
      >
        {children}
      </div>

      {controlsPlacement === "after" ? controls : null}
    </section>
  );
}
