import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface YieldSliderProps {
  label: string;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
}

export const YieldSlider: React.FC<YieldSliderProps> = ({ label, value, defaultValue, onChange }) => {
  const pct = Math.round(value * 100);
  const isLow = pct < 20;
  const isHigh = pct > 90;
  const isExtreme = isLow || isHigh;

  return (
    <div className="flex items-center gap-3 py-1">
      <SlidersHorizontal size={13} className="text-slate-600 shrink-0" />
      <span className="text-[11px] text-slate-500 w-[100px] shrink-0">{label}</span>
      <input
        type="range"
        min={10}
        max={95}
        step={1}
        value={pct}
        onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
        className="flex-1 h-1 bg-[#151B25] rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#06080C]
          [&::-webkit-slider-thumb]:hover:bg-blue-300 [&::-webkit-slider-thumb]:transition-colors"
        aria-label={`${label} yield factor`}
      />
      <span className={`text-sm font-bold tabular-nums w-[42px] text-right ${
        isExtreme ? 'text-amber-400' : 'text-white'
      }`}>
        {pct}%
      </span>
      <span className="text-[10px] text-slate-700 w-[50px]">
        def {Math.round(defaultValue * 100)}%
      </span>
    </div>
  );
};
