import type { ReactNode } from "react";

type ContentGridProps = {
  itemsCount: number;
  emptyMessage: string;
  columnsClassName?: string;
  children: ReactNode;
};

export function ContentGrid({
  itemsCount,
  emptyMessage,
  columnsClassName = "grid gap-6",
  children,
}: ContentGridProps) {
  if (itemsCount === 0) {
    return <p className="text-lg text-muted-foreground">{emptyMessage}</p>;
  }

  return <div className={columnsClassName}>{children}</div>;
}
