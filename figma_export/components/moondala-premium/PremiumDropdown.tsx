import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PremiumDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
  searchable?: boolean;
}

export function PremiumDropdown({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = 'Select...',
  searchable = false,
}: PremiumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-white/70 mb-2">
        {label}
        {required && <span className="text-[#F472B6] ml-1">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-left transition-all hover:border-white/20 focus:outline-none focus:border-[#D4AF37] backdrop-blur-sm flex items-center justify-between focus:shadow-lg focus:shadow-[#D4AF37]/15"
      >
        <span className={value ? 'text-white font-medium' : 'text-white/30'}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#D4AF37]/60 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[#1a1530]/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {searchable && (
              <div className="p-3 border-b border-white/10">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] text-sm"
                  autoFocus
                />
              </div>
            )}

            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-5 py-3 text-left transition-colors font-medium ${
                      value === option
                        ? 'bg-gradient-to-r from-[#6B46C1]/15 to-[#D4AF37]/15 text-white'
                        : 'text-white/70 hover:bg-white/8'
                    }`}
                  >
                    {option}
                  </button>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-white/40 text-sm">
                  No results found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}