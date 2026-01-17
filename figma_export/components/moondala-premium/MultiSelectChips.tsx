import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MultiSelectChipsProps {
  label: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  options: string[];
  placeholder?: string;
}

export function MultiSelectChips({
  label,
  selected,
  onChange,
  options,
  placeholder = 'Search and select...',
}: MultiSelectChipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(
    (option) =>
      !selected.includes(option) &&
      option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const chipColors = [
    { from: '#6B46C1', to: '#8B5CF6' },
    { from: '#D4AF37', to: '#C4A962' },
    { from: '#8B5CF6', to: '#D4AF37' },
  ];

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-white/70 mb-2">
        {label}
      </label>

      {/* Selected Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <AnimatePresence>
            {selected.map((item, index) => {
              const colorPair = chipColors[index % chipColors.length];
              return (
                <motion.div
                  key={item}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colorPair.from} 0%, ${colorPair.to} 100%)`,
                  }}
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => toggleOption(item)}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A78BFA]/60 pointer-events-none z-10">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 transition-all focus:outline-none focus:border-[#D4AF37] hover:border-white/20 backdrop-blur-sm focus:shadow-lg focus:shadow-[#D4AF37]/15"
        />
      </div>

      {/* Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-3 bg-[#1a1530]/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    toggleOption(option);
                    setSearchQuery('');
                  }}
                  className="w-full px-5 py-3 text-left text-white/80 hover:bg-gradient-to-r hover:from-[#6B46C1]/15 hover:to-[#D4AF37]/15 transition-all first:rounded-t-2xl last:rounded-b-2xl font-medium"
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-white/40 text-sm">
                {searchQuery ? 'No results found' : 'Start typing to search...'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}