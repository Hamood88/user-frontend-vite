import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-yellow-400 via-yellow-300 to-purple-500 text-white hover:from-yellow-300 hover:via-yellow-200 hover:to-purple-600 shadow-lg shadow-yellow-500/20",
        shop: "bg-gradient-to-r from-yellow-400 via-yellow-300 to-purple-500 text-white hover:from-yellow-300 hover:via-yellow-200 hover:to-purple-600 shadow-lg shadow-yellow-500/20",
        secondary: "bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/20 hover:ring-white/30",
        ghost: "hover:bg-white/10 text-white",
      },
      size: {
        default: "py-3 px-4 text-base",
        sm: "py-2 px-3 text-sm",
        lg: "py-3.5 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
