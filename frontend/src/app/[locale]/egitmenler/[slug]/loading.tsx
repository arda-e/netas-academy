import { RouteLoading } from "@/components/content/route-loading";

export default function TeacherDetailLoading() {
  return (
    <div className="page-section pt-8 sm:pt-12">
      <RouteLoading testId="loading.teacher-detail">
        <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <div className="flex items-start gap-6 sm:gap-8">
            <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-slate-200 sm:h-28 sm:w-28" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-8 w-2/3 animate-pulse rounded-sm bg-slate-200 sm:h-10" />
              <div className="h-5 w-full animate-pulse rounded-sm bg-slate-200" />
              <div className="h-5 w-3/4 animate-pulse rounded-sm bg-slate-200" />
            </div>
          </div>
          <div className="h-px w-full bg-slate-100" />
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-sm bg-slate-200" />
            <div className="flex gap-2">
              <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-slate-200" />
          </div>
        </div>
      </RouteLoading>
    </div>
  );
}
