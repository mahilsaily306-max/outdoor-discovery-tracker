"use client";

import { Clock } from "lucide-react";

interface DurationOption {
  minutes: number;
  label: string;
  subtitle: string;
}

const DURATIONS: DurationOption[] = [
  { minutes: 15, label: "15 min", subtitle: "Quick sensory reset" },
  { minutes: 30, label: "30 min", subtitle: "Mindful exploration" },
  { minutes: 45, label: "45 min", subtitle: "Deep green loop" },
  { minutes: 60, label: "60 min", subtitle: "Full nature immersion" },
];

interface DurationSelectorProps {
  selected: number;
  onSelect: (minutes: number) => void;
  disabled?: boolean;
}

export function DurationSelector({ selected, onSelect, disabled }: DurationSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Step 2: Available Outdoor Time
        </label>
        <span className="text-xs text-muted font-mono">{selected} minutes</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DURATIONS.map((dur) => {
          const isSelected = selected === dur.minutes;

          return (
            <button
              key={dur.minutes}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dur.minutes)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-all outline-none
                ${
                  isSelected
                    ? "bg-[#112a1d] border-2 border-emerald-400 text-white shadow-md shadow-emerald-950/60 font-semibold"
                    : "bg-[#0b1b13]/80 hover:bg-[#0f241a] border border-[#1b3a28] text-[#a4b8ad] hover:text-white"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-95"}
              `}
              aria-pressed={isSelected}
            >
              <span className="text-base font-bold tracking-tight text-white">
                {dur.label}
              </span>
              <span className="text-[10px] text-emerald-400/80 mt-0.5">
                {dur.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
