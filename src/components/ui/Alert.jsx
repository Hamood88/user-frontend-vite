import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "../../lib/utils"

export function Alert({ type = "error", message, className }) {
  const isError = type === "error"
  const isSuccess = type === "success"

  if (isError) {
    return (
      <div className={cn(
        "flex items-start gap-3 p-4 bg-red-500/10 ring-1 ring-red-400/30 rounded-xl",
        className
      )}>
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-200">{message}</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-4 bg-green-500/10 ring-1 ring-green-400/30 rounded-xl animate-in fade-in",
        className
      )}>
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-300 font-medium">{message}</p>
      </div>
    )
  }
}
