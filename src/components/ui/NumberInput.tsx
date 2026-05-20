import { useState, useEffect, useRef } from 'react';

type Props = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function NumberInput({ label, value, onChange, min, max, step, className = '' }: Props) {
  const [display, setDisplay] = useState(String(value));
  const isFocused = useRef(false);

  // Sync external value changes (e.g., canvas drag) only when not actively editing
  useEffect(() => {
    if (!isFocused.current) {
      setDisplay(String(value));
    }
  }, [value]);

  const inputId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-600">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="number"
        className={`px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${className}`}
        value={display}
        min={min}
        max={max}
        step={step}
        onFocus={() => { isFocused.current = true; }}
        onChange={(e) => {
          setDisplay(e.target.value);
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) onChange(num);
        }}
        onBlur={() => {
          isFocused.current = false;
          const num = parseFloat(display);
          if (isNaN(num)) {
            setDisplay(String(value));
          } else {
            setDisplay(String(num));
            onChange(num);
          }
        }}
      />
    </div>
  );
}
