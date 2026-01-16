import React from "react";

export function ReferralField({ label, value, onChange, autoGenerate, helperText }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] text-white ring-1 ring-white/10"
          placeholder="Your referral code"
        />
        {autoGenerate && (
          <button
            type="button"
            onClick={() => onChange((Math.random() + 1).toString(36).substring(2, 10).toUpperCase())}
            className="px-3 py-2 rounded-lg bg-white/6 text-white/90"
          >
            Generate
          </button>
        )}
      </div>
      {helperText && <p className="mt-1 text-xs text-white/45">{helperText}</p>}
    </div>
  );
}

export default ReferralField;
