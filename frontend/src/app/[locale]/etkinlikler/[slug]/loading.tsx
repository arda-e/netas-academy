import { RouteLoading } from "@/components/content/route-loading";

export default function EventDetailLoading() {
  return (
    <div className="page-section pt-8 sm:pt-12">
      <RouteLoading testId="loading.event-detail">
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.42fr)]">
            <div className="h-64 animate-pulse rounded-sm bg-slate-200 sm:h-80" />
            <div className="h-64 animate-pulse rounded-sm bg-slate-200 sm:h-80" />
          </div>
        </div>
      </RouteLoading>
    </div>
  );
}
