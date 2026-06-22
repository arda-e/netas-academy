import type { ReactNode } from "react";

import { join } from "@/lib/testids";

type ContentGridProps = {
  items: {
    count: number;
    emptyMessage: string;
  };
  layout?: {
    columnsClassName?: string;
  };
  children?: ReactNode;
  slots?: {
    skeleton?: ReactNode;
  };
  testId?: string;
};

export function ContentGrid({
  items,
  layout,
  children,
  slots,
  testId,
}: ContentGridProps) {
  const columnsClassName = layout?.columnsClassName ?? "grid gap-4 sm:gap-6";

  if (slots?.skeleton) {
    return (
      <div className={columnsClassName} data-testid={testId}>
        {slots.skeleton}
      </div>
    );
  }

  if (items.count === 0) {
    return (
      <p
        className="text-lg text-muted-foreground"
        data-testid={testId ? join(testId, "empty") : "content-grid.empty"}
      >
        {items.emptyMessage}
      </p>
    );
  }

  return (
    <div className={columnsClassName} data-testid={testId}>
      {children}
    </div>
  );
}
