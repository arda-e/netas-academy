import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContentSuperheadingProps = {
  children: ReactNode;
  className?: string;
};

export function ContentSuperheading({
  children,
  className,
}: ContentSuperheadingProps) {
  return (
    <p
      className={cn(
        "text-sm font-bold uppercase tracking-[0.18em] text-primary/72 transition-colors",
        className
      )}
    >
      {children}
    </p>
  );
}
