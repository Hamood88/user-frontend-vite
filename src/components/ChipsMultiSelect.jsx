import React, { useState } from "react";
import { X } from "lucide-react";

export function ChipsMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option) => {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else onChange([...value, option]);
  };

  const removeOption = (option) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                bg-white/5 ring-1 ring-white/10 text-white/85"
            >
              {item}
              <button
                type="button"
                onClick={() => removeOption(item)}
                className="hover:bg-white/10 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.03] text-white/85 ring-1 ring-white/10 hover:ring-white/20
            focus:outline-none focus:ring-2 focus:ring-white/20 text-left text-sm"
        >
          {value.length > 0 ? `${value.length} selected` : placeholder || "Select options..."}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute z-20 w-full mt-1 rounded-lg ring-1 ring-white/10 bg-[#0B1020]/95 backdrop-blur shadow-xl max-h-60 overflow-auto">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <span className="text-sm text-white/80">{option}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChipsMultiSelect;
