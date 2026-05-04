import type { ReactNode } from "react";

import { join } from "@/lib/testids";

type ContentGridProps = {
  itemsCount: number;
  emptyMessage: string;
  columnsClassName?: string;
  children?: ReactNode;
  skeleton?: ReactNode;
  testId?: string;
};

export function ContentGrid({
  itemsCount,
  emptyMessage,
  columnsClassName = "grid gap-4 sm:gap-6",
  children,
  skeleton,
  testId,
}: ContentGridProps) {

  if (skeleton) return <div className={columnsClassName} data-testid={testId}>{skeleton}</div>;  
  
  if (itemsCount === 0) {
    return (
      <p
        className="text-lg text-muted-foreground"
        data-testid={
          testId ? join(testId, 'empty') : "content-grid.empty"
        }
      >
        {emptyMessage}
      </p>
    );
  }

  return <div className={columnsClassName} data-testid={testId}>{children}</div>;
}
