import { PremiumDropdown } from './PremiumDropdown';

interface DOBSelectorProps {
  day: string;
  month: string;
  year: string;
  onDayChange: (day: string) => void;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  required?: boolean;
}

export function DOBSelector({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  required,
}: DOBSelectorProps) {
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  return (
    <div>
      <label className="block text-sm font-medium text-white/60 mb-2">
        Date of Birth
        {required && <span className="text-[#D4AF37] ml-1">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-3">
        <PremiumDropdown
          label=""
          value={day}
          onChange={onDayChange}
          options={days}
          placeholder="Day"
        />
        <PremiumDropdown
          label=""
          value={month}
          onChange={onMonthChange}
          options={months}
          placeholder="Month"
        />
        <PremiumDropdown
          label=""
          value={year}
          onChange={onYearChange}
          options={years}
          placeholder="Year"
        />
      </div>
    </div>
  );
}
