import { RouteLoading } from "@/components/content/route-loading";

export default function CourseDetailLoading() {
  return (
    <div className="page-section pt-8 sm:pt-12">
      <RouteLoading testId="loading.course-detail">
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded-sm bg-slate-200 sm:h-12" />
            <div className="h-5 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-5 w-2/3 animate-pulse rounded-sm bg-slate-200" />
          </div>
          <div className="h-px w-full bg-slate-100" />
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded-sm bg-slate-200" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-3/4 animate-pulse rounded-sm bg-slate-200" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-slate-200" />
          </div>
        </div>
      </RouteLoading>
    </div>
  );
}
