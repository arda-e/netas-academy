import type { ReactNode } from "react";

type SkeletonBoxProps = {
  className?: string;
};

function SkeletonBox({ className }: SkeletonBoxProps) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-slate-200 ${className ?? ""}`}
      role="presentation"
    />
  );
}

function HeroLoadingBar({ className }: SkeletonBoxProps) {
  return (
    <div
      className={`animate-pulse rounded-full bg-white/16 ${className ?? ""}`}
      role="presentation"
    />
  );
}

type RouteLoadingProps = {
  testId?: string;
  children?: ReactNode;
};

export function RouteLoading({ testId, children }: RouteLoadingProps) {
  return (
    <div data-testid={testId}>
      {children ?? (
        <div className="space-y-6">
          <SkeletonBox className="h-8 w-48" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-3/4" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonBox className="h-48" />
            <SkeletonBox className="h-48" />
            <SkeletonBox className="h-48" />
          </div>
        </div>
      )}
    </div>
  );
}

export function HeroDescriptionLoading({
  testId,
}: {
  testId?: string;
}) {
  return (
    <div className="max-w-2xl space-y-3 sm:space-y-4" data-testid={testId}>
      <HeroLoadingBar className="h-4 w-full max-w-[34rem]" />
      <HeroLoadingBar className="h-4 w-5/6 max-w-[28rem]" />
    </div>
  );
}

export function HeroDescriptionWithTrailingLoading({
  descriptionTestId,
}: {
  descriptionTestId?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
      <HeroDescriptionLoading testId={descriptionTestId} />
      <div className="flex shrink-0 justify-end lg:pb-1" aria-hidden="true">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <HeroLoadingBar className="size-10 bg-white/12" />
          <div className="flex flex-col items-start gap-2">
            <HeroLoadingBar className="h-4 w-32" />
            <HeroLoadingBar className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseListLoading({ testId }: { testId?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6" data-testid={testId}>
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonBox key={index} className="h-72" />
      ))}
    </div>
  );
}

export function EventListLoading({ testId }: { testId?: string }) {
  return (
    <div className="space-y-4" data-testid={testId}>
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonBox key={index} className="h-40" />
      ))}
    </div>
  );
}

export function BlogListLoading({ testId }: { testId?: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid={testId}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <SkeletonBox className="aspect-[16/9]" />
          <SkeletonBox className="h-6 w-3/4" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SearchFieldLoading({
  testId,
  expandedWidthClassName = "lg:w-[420px]",
}: {
  testId?: string;
  expandedWidthClassName?: string;
}) {
  return (
    <div
      className={`h-9 w-full max-w-full rounded-sm border border-border/70 bg-white/70 ${expandedWidthClassName}`}
      data-testid={testId}
    >
      <div className="flex h-full items-center px-3">
        <SkeletonBox className="size-4 rounded-full" />
        <SkeletonBox className="ml-3 h-3 w-36 max-w-[65%]" />
      </div>
    </div>
  );
}

export function FilterPillsLoading({
  count,
  testId,
  includeIcon = true,
}: {
  count: number;
  testId?: string;
  includeIcon?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid={testId}>
      {includeIcon ? <SkeletonBox className="size-4 rounded-full" /> : null}
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBox
          key={index}
          className={index % 2 === 0 ? "h-8 w-24 rounded-full" : "h-8 w-32 rounded-full"}
        />
      ))}
    </div>
  );
}

export function SortButtonLoading({ testId }: { testId?: string }) {
  return (
    <div
      className="inline-flex h-10 w-36 self-start items-center justify-center gap-2 rounded-full border border-border/70 bg-white px-4 md:self-auto"
      data-testid={testId}
    >
      <SkeletonBox className="size-4 rounded-full" />
      <SkeletonBox className="h-3 w-20" />
    </div>
  );
}

export function TeacherListLoading({ testId }: { testId?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6" data-testid={testId}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-4 rounded-sm bg-slate-50 p-5 sm:p-6">
          <SkeletonBox className="mx-auto h-24 w-24 rounded-full sm:h-28 sm:w-28" />
          <div className="space-y-2 text-center">
            <SkeletonBox className="mx-auto h-5 w-2/3" />
            <SkeletonBox className="mx-auto h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
