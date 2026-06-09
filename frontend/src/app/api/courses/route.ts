import { getCourseList } from "@/lib/course-service";
import { COURSE_LIST_SORTS, parsePaginationParamsDTO } from "@/lib/pagination-params-dto";

const MAX_COURSE_LIST_PAGE_SIZE = 100;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pagination = parsePaginationParamsDTO(url.searchParams, {
      maxPageSize: MAX_COURSE_LIST_PAGE_SIZE,
      allowedSorts: COURSE_LIST_SORTS,
      defaultSort: "asc",
    });

    const courses = await getCourseList({
      ...pagination,
    });

    return Response.json(courses);
  } catch (error) {
    console.error(JSON.stringify({
      route: "courses",
      errorCategory: "controller",
      message: `Error fetching course list: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return Response.json(
      { error: "Failed to fetch courses" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
