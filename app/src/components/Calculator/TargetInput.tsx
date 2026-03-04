import React, { useState, useCallback } from 'react';
import { Target, AlertTriangle } from 'lucide-react';

interface TargetInputProps {
  value: number;
  onChange: (g: number) => void;
}

export const TargetInput: React.FC<TargetInputProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num >= 1 && num <= 500) {
      onChange(num);
    }
  }, [onChange]);

  const num = parseFloat(localValue);
  const isValid = !isNaN(num) && num >= 1 && num <= 500;
  const isSmall = isValid && num < 5;
  const isLarge = isValid && num > 200;

  return (
    <div className="flex flex-col items-center py-8 px-6">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-blue-400" />
        <span className="text-[11px] font-semibold tracking-[2px] uppercase text-slate-500">
          Target Output
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <div className={`relative rounded-2xl transition-all duration-200 ${
          isFocused ? 'ring-2 ring-blue-500/30' : ''
        }`}>
          <input
            type="number"
            min={1}
            max={500}
            step={1}
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-[150px] py-3 px-4 rounded-2xl text-center text-[42px] font-black
              bg-[#0C1017] outline-none transition-colors duration-200
              ${isValid ? 'text-white border-2 border-[#151B25]' : 'text-red-400 border-2 border-red-500/40'}
            `}
            aria-label="Target yield in grams"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-blue-400 text-xl font-bold">grams</span>
          <span className="text-slate-600 text-[10px]">final crystal</span>
        </div>
      </div>

      {!isValid && (
        <div className="flex items-center gap-1.5 mt-3 text-red-400 text-xs font-semibold">
          <AlertTriangle size={12} />
          Enter 1 – 500 grams
        </div>
      )}
      {isSmall && (
        <div className="flex items-center gap-1.5 mt-3 text-amber-500/80 text-[11px]">
          <AlertTriangle size={11} />
          Very small batch — losses will be high
        </div>
      )}
      {isLarge && (
        <div className="flex items-center gap-1.5 mt-3 text-amber-500/80 text-[11px]">
          <AlertTriangle size={11} />
          Large batch — read Chapter 4 scale-up warnings
        </div>
      )}
    </div>
  );
};
