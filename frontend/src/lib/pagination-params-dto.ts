import { z } from "zod";

export const COURSE_LIST_SORTS = ["asc", "desc"] as const;

export type CourseListSort = (typeof COURSE_LIST_SORTS)[number];

export type PaginationParamsDTO = {
  page?: number;
  pageSize?: number;
  sort?: CourseListSort;
};

type PaginationParamsDTOOptions = {
  maxPageSize?: number;
  allowedSorts?: readonly CourseListSort[];
  defaultSort?: CourseListSort;
};

const positiveIntegerParamSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed ? Number(trimmed) : undefined;
}, z.number().int().min(1).optional()).catch(undefined);

export const PaginationParamsDTOSchema = z.object({
  page: positiveIntegerParamSchema,
  pageSize: positiveIntegerParamSchema,
  sort: z.string().trim().optional().catch(undefined),
});

export function parsePaginationParamsDTO(
  searchParams: URLSearchParams,
  options: PaginationParamsDTOOptions = {}
): PaginationParamsDTO {
  const { page, pageSize, sort } = PaginationParamsDTOSchema.parse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    sort: searchParams.get("sort"),
  });
  const { maxPageSize, allowedSorts, defaultSort } = options;
  const resolvedSort = (sort as CourseListSort | undefined) ?? defaultSort;

  return {
    page,
    pageSize: maxPageSize && pageSize ? Math.min(pageSize, maxPageSize) : pageSize,
    sort: resolvedSort === undefined
      ? undefined
      : !allowedSorts || allowedSorts.includes(resolvedSort)
        ? resolvedSort
        : undefined,
  };
}
