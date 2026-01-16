import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export const Input = forwardRef((
  {
    label,
    error,
    showToggle,
    type = "text",
    className = "",
    locked,
    helperText,
    ...props
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  const isReadOnly = Boolean(locked || props.readOnly || props.disabled);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/80 mb-1.5">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={[
            "w-full px-3 py-2 rounded-lg outline-none transition-all",
            "bg-white/[0.03] ring-1 ring-white/10",
            "hover:ring-white/20 focus:ring-2 focus:ring-white/20",
            "text-white placeholder:text-white/35",
            error ? "ring-red-400/30 bg-red-500/10" : "",
            isReadOnly ? "opacity-90" : "",
            isPasswordField && showToggle ? "pr-10" : "",
            locked ? "pr-10" : "",
            className,
          ].join(" ")}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
          readOnly={locked || props.readOnly}
        />

        {locked && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/60">
            <Lock className="w-4 h-4" />
          </div>
        )}

        {isPasswordField && showToggle && !locked && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/55 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
            disabled={isReadOnly}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {helperText && !error && <p className="mt-1 text-xs text-white/45">{helperText}</p>}

      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
