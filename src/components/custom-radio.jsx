import React from "react";

export default function CustomRadio({
  name,
  value,
  selectedValue,
  onChange,
  children,
}) {
  // Generate a unique ID so labels link correctly to inputs
  const inputId = `radio-${value}`;

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="radio"
        name={name}
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        checked={selectedValue === value}
      />
      <label className="form-check-label" htmlFor={inputId}>
        {children}
      </label>
    </div>
  );
}
