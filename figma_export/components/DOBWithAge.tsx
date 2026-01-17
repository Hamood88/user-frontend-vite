import { useState, useEffect } from 'react';
import { Input } from './Input';

interface DOBWithAgeProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DOBWithAge({ value, onChange, error }: DOBWithAgeProps) {
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [value]);

  return (
    <div className="w-full">
      <Input
        label="Date of Birth"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        max={new Date().toISOString().split('T')[0]}
      />
      {age !== null && (
        <p className="mt-1.5 text-xs text-slate-600 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          Age: {age} years old
          {age < 10 && <span className="text-amber-600 ml-1">(Minimum age is 10)</span>}
        </p>
      )}
    </div>
  );
}
