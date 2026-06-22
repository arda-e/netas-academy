import type { ReactNode } from "react";

import { formatEventDateTime } from "@/lib/date-formatting";
import { cn } from "@/lib/utils";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-widest text-foreground/48">
        {label}
      </span>
      <span className="text-base font-medium text-foreground/88">{value}</span>
    </div>
  );
}

type EventInformationPanelProps = {
  event: {
    title: string;
    startsAt: string;
    endsAt?: string | null;
    location?: string | null;
    format?: string | null;
    price?: number | null;
    dailySchedule?: string | null;
    formatDisplayName?: string | null;
    registrationState?: {
      label: string;
      value: string;
      tone?: "success" | "warning";
    } | null;
  };
  copy: {
    infoPanelHeading: string;
    dateLabel: string;
    endDateLabel?: string;
    locationLabel: string;
    formatLabel: string;
    priceLabel: string;
    scheduleLabel: string;
  };
  bodyContent?: ReactNode;
  action?: ReactNode;
  testId?: string;
};

export function EventInformationPanel({
  event,
  copy,
  bodyContent,
  action,
  testId,
}: EventInformationPanelProps) {
  const {
    title,
    startsAt,
    endsAt,
    location,
    format,
    price,
    dailySchedule,
    formatDisplayName,
    registrationState,
  } = event;
  const {
    infoPanelHeading,
    dateLabel,
    endDateLabel,
    locationLabel,
    formatLabel,
    priceLabel,
    scheduleLabel,
  } = copy;

  const hasLogisticsRows =
    Boolean(dailySchedule) ||
    Boolean(format && formatDisplayName) ||
    Boolean(location) ||
    price != null ||
    Boolean(registrationState);

  const registrationStateClassName =
    registrationState?.tone === "warning"
      ? "font-semibold text-amber-300"
      : "font-semibold text-emerald-400";

  return (
    <aside className="panel-surface rounded-sm p-6 md:p-8" data-testid={testId}>
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
        {infoPanelHeading}
      </p>
      <div className="mt-5 space-y-5 divide-y divide-white/8">
        <div className="space-y-4">
          <p className="text-lg font-bold text-foreground">{title}</p>
          <InfoRow label={dateLabel} value={formatEventDateTime(startsAt)} />
          {endsAt && (
            <InfoRow
              label={endDateLabel ?? dateLabel}
              value={<span className="text-sm text-foreground/60">{formatEventDateTime(endsAt)}</span>}
            />
          )}
        </div>

        {(bodyContent || hasLogisticsRows) && (
          <div className="space-y-4 pt-5">
            {bodyContent}

            {hasLogisticsRows && (
              <div className="space-y-4">
                {dailySchedule && <InfoRow label={scheduleLabel} value={dailySchedule} />}
                {format && formatDisplayName && (
                  <InfoRow label={formatLabel} value={formatDisplayName} />
                )}
                {location && <InfoRow label={locationLabel} value={location} />}
                {price != null && (
                  <InfoRow
                    label={priceLabel}
                    value={`${new Intl.NumberFormat("tr-TR").format(price)} TL + KDV`}
                  />
                )}
                {registrationState && (
                  <InfoRow
                    label={registrationState.label}
                    value={
                      <span className={cn("text-base", registrationStateClassName)}>
                        {registrationState.value}
                      </span>
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {action}
    </aside>
  );
}
