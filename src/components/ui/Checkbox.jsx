import { cn } from "../../lib/utils"

export function Checkbox({ 
  id,
  label,
  error,
  className,
  ...props 
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "w-5 h-5 rounded border-gray-700 bg-gray-900/40 accent-purple-500 cursor-pointer",
          "hover:bg-gray-800/50 transition-colors",
          error ? "border-red-500/50" : "",
          className
        )}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="text-sm text-gray-300 cursor-pointer hover:text-gray-200 transition-colors">
          {label}
        </label>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
