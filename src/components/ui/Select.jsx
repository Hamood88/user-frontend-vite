import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export function Select({ 
  icon: Icon,
  error,
  options = [],
  placeholder = "Select...",
  className,
  ...props 
}) {
  return (
    <div className="relative w-full">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 relative",
        "bg-gray-900/40 border-gray-700/50 hover:bg-gray-900/60 hover:border-gray-600/50 focus-within:border-purple-500/50",
        error ? "border-red-500/50 bg-red-500/5" : "",
        className
      )}>
        {Icon && <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />}
        <select
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 text-sm appearance-none cursor-pointer"
          {...props}
        >
          <option value="" disabled selected className="text-gray-600">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 pointer-events-none absolute right-3" />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}
