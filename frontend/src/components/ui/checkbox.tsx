"use client";

import type { ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";

import { cn } from "@/lib/utils";

export interface CheckboxBaseProps {
  size?: "sm" | "md";
  className?: string;
  isFocusVisible?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
}

export function CheckboxBase({
  className,
  isSelected,
  isDisabled,
  isIndeterminate,
  size = "sm",
  isFocusVisible = false,
}: CheckboxBaseProps) {
  return (
    <div
      className={cn(
        "relative flex size-4 shrink-0 cursor-pointer appearance-none items-center justify-center rounded bg-white ring-1 ring-border ring-inset transition-colors",
        size === "md" && "size-5 rounded-md",
        (isSelected || isIndeterminate) && "bg-primary ring-primary",
        isDisabled && "cursor-not-allowed opacity-50",
        isDisabled && !(isSelected || isIndeterminate) && "bg-muted",
        isFocusVisible && "outline-2 outline-offset-2 outline-ring",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 14 14"
        fill="none"
        className={cn(
          "pointer-events-none absolute h-3 w-2.5 text-primary-foreground opacity-0 transition-opacity",
          size === "md" && "size-3.5",
          isIndeterminate && "opacity-100",
        )}
      >
        <path d="M2.91675 7H11.0834" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 14 14"
        fill="none"
        className={cn(
          "pointer-events-none absolute size-3 text-primary-foreground opacity-0 transition-opacity",
          size === "md" && "size-3.5",
          isSelected && !isIndeterminate && "opacity-100",
        )}
      >
        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

CheckboxBase.displayName = "CheckboxBase";

interface CheckboxProps extends AriaCheckboxProps {
  size?: "sm" | "md";
  label?: ReactNode;
  hint?: ReactNode;
}

export function Checkbox({
  label,
  hint,
  size = "sm",
  className,
  ...ariaCheckboxProps
}: CheckboxProps) {
  const sizes = {
    sm: {
      root: "gap-2",
      textWrapper: "",
      label: "text-sm font-medium",
      hint: "text-sm",
    },
    md: {
      root: "gap-3",
      textWrapper: "gap-0.5",
      label: "text-base font-medium",
      hint: "text-base",
    },
  };

  return (
    <AriaCheckbox
      {...ariaCheckboxProps}
      className={(state) =>
        cn(
          "relative flex items-start",
          state.isDisabled && "cursor-not-allowed",
          sizes[size].root,
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isSelected, isIndeterminate, isDisabled, isFocusVisible }) => (
        <>
          <CheckboxBase
            size={size}
            isSelected={isSelected}
            isIndeterminate={isIndeterminate}
            isDisabled={isDisabled}
            isFocusVisible={isFocusVisible}
            className={label || hint ? "mt-0.5" : ""}
          />
          {(label || hint) && (
            <div className={cn("inline-flex flex-col", sizes[size].textWrapper)}>
              {label && <p className={cn("select-none text-foreground", sizes[size].label)}>{label}</p>}
              {hint && (
                <span className={cn("text-muted-foreground", sizes[size].hint)} onClick={(event) => event.stopPropagation()}>
                  {hint}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </AriaCheckbox>
  );
}

Checkbox.displayName = "Checkbox";
