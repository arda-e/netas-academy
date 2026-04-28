import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 rounded-sm border-3 border-gray-200 bg-white px-3 py-1",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
