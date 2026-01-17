import { Lock } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface LockedInputProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  isLocked: boolean;
  helperText: string;
  tooltipText?: string;
}

export function LockedInput({
  label,
  value,
  onChange,
  isLocked,
  helperText,
  tooltipText,
}: LockedInputProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-semibold text-white/70">
          {label}
        </label>
        {tooltipText && (
          <Tooltip content={tooltipText}>
            <button
              type="button"
              className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#D4AF37] text-white text-xs flex items-center justify-center hover:scale-110 transition-transform font-bold shadow-lg"
            >
              ?
            </button>
          </Tooltip>
        )}
      </div>

      <div className="relative">
        {isLocked && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] pointer-events-none z-10">
            <Lock className="w-5 h-5" />
          </div>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={isLocked}
          placeholder={isLocked ? '' : 'Enter inviter code (optional)'}
          className={`w-full ${isLocked ? 'pl-12' : 'pl-4'} pr-24 py-4 border rounded-2xl text-white placeholder-white/30 transition-all focus:outline-none backdrop-blur-sm ${
            isLocked 
              ? 'bg-gradient-to-r from-[#6B46C1]/8 to-[#D4AF37]/8 border-[#D4AF37]/30 cursor-not-allowed' 
              : 'bg-white/5 border-white/10 hover:border-white/20 focus:border-[#D4AF37] focus:shadow-lg focus:shadow-[#D4AF37]/15'
          }`}
        />

        {isLocked && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="px-3 py-1.5 bg-gradient-to-r from-[#6B46C1] to-[#D4AF37] rounded-full text-xs text-white font-semibold shadow-lg">
              Applied ✓
            </div>
          </div>
        )}
      </div>

      <p className={`mt-2 text-xs font-medium flex items-start gap-1.5 ${isLocked ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        {isLocked && (
          <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        )}
        <span>{helperText}</span>
      </p>
    </div>
  );
}