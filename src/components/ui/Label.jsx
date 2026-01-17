import { cn } from "../../lib/utils"

export function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide",
        className
      )}
      {...props}
    />
  )
}
