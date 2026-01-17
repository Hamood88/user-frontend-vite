import { useState } from 'react';
import { X } from 'lucide-react';

interface ChipsMultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function ChipsMultiSelect({ label, options, value, onChange, placeholder }: ChipsMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      
      {/* Selected Chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => removeOption(item)}
                className="hover:bg-blue-200 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-sm"
        >
          {value.length > 0 ? `${value.length} selected` : placeholder || 'Select options...'}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
