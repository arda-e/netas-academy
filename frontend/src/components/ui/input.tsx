import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border-3 border-gray-200, bg-white px-3 py-1",
              )}
      {...props}
    />
  )
}

export { Input }
