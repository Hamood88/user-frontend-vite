import React from "react";

/**
 * ⭐ StarRating
 * - If onChange is provided => clickable (for writing reviews)
 * - If no onChange => read-only
 */
export default function StarRating({ value = 0, onChange, disabled = false, size = 18 }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const clickable = typeof onChange === "function" && !disabled;

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= v;
        return (
          <span
            key={i}
            onClick={clickable ? () => onChange(i) : undefined}
            style={{
              fontSize: size,
              lineHeight: 1,
              cursor: clickable ? "pointer" : "default",
              userSelect: "none",
              color: active ? "#facc15" : "rgba(255,255,255,0.25)",
              opacity: disabled ? 0.6 : 1,
            }}
            title={clickable ? `Rate ${i}` : ""}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
