"use client";

import { Button } from "@/components/ui/button";

type PaymentStatusPanelProps = {
  title: string;
  body: string;
  actionLabel?: string;
  isRetrying?: boolean;
  onRetry?: () => void;
};

export function PaymentStatusPanel({ title, body, actionLabel, isRetrying, onRetry }: PaymentStatusPanelProps) {
  return (
    <div className="space-y-4 rounded-sm border border-border/70 bg-card/55 px-5 py-5 text-foreground" data-testid="payment.status-panel">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h3>
        <p className="text-sm leading-7 text-muted-foreground md:text-base">{body}</p>
      </div>

      {actionLabel && onRetry ? (
        <Button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-11 rounded-sm px-6 text-base font-semibold"
          data-testid="payment.retry"
        >
          {isRetrying ? actionLabel : actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
