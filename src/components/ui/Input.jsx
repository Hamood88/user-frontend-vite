import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "../../lib/utils"

export function Input({ 
  icon: Icon, 
  error,
  type: inputType = "text",
  className, 
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = inputType === "password"
  const type = isPassword && showPassword ? "text" : inputType

  return (
    <div className="relative w-full">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200",
        "bg-gray-900/40 border-gray-700/50 hover:bg-gray-900/60 hover:border-gray-600/50 focus-within:border-purple-500/50",
        error ? "border-red-500/50 bg-red-500/5" : "",
        className
      )}>
        {Icon && <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
        <input
          type={type}
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 text-sm"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-400 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
