import { useState, useEffect } from "react";
import { Input } from "./Input";

export function DOBWithAge({ value, onChange, error }) {
  const [age, setAge] = useState(null);

  useEffect(() => {
    if (!value) return setAge(null);

    const birthDate = new Date(value);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    setAge(calculatedAge);
  }, [value]);

  return (
    <div className="w-full">
      <Input
        label="Date of Birth"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        max={new Date().toISOString().split("T")[0]}
      />
      {age !== null && (
        <p className="mt-1.5 text-xs text-white/55 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Age: {age}
          {age < 10 && <span className="text-amber-200">(Minimum age is 10)</span>}
        </p>
      )}
    </div>
  );
}

export default DOBWithAge;
