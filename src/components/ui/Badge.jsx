import { cn } from "../../lib/utils"

export function Badge({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
        "border border-purple-500/40 text-gray-300 bg-gray-900/30",
        "transition-all hover:bg-gray-800/50 hover:border-purple-500/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
