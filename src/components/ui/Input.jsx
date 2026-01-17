import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "../../lib/utils"

export function Input({ 
  icon: Icon, 
  iconColor = "text-cyan-400/40",
  error,
  type: inputType = "text",
  className, 
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = inputType === "password"
  const type = isPassword && showPassword ? "text" : inputType

  return (
    <div className="relative">
      {Icon && (
        <Icon className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", iconColor)} />
      )}
      <input
        type={type}
        className={cn(
          "w-full px-3 py-2.5 rounded-xl bg-white/[0.04] text-white placeholder-gray-500 ring-1 ring-white/15 focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/[0.06] transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          Icon && "pl-9",
          isPassword && "pr-9",
          error && "ring-red-400/50 focus:ring-red-400/70",
          className
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      )}
      {error && (
        <span className="text-xs text-red-400 mt-1.5 block">{error}</span>
      )}
    </div>
  )
}
