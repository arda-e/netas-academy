export const responsiveLayoutClasses = {
  courseListGrid: "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3",
  eventListGrid: "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5",
  blogListGrid: "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5",
  newsListGrid: "grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-5",
  eventMeta:
    "flex flex-col gap-1.5 break-words text-sm leading-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-base",
  eventCta: "w-full rounded-sm sm:w-auto sm:self-start",
} as const;
