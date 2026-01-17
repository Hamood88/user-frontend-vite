import { cn } from "../../lib/utils"

export function Badge({ children, className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-white/20 bg-white/5 hover:bg-white/10 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
