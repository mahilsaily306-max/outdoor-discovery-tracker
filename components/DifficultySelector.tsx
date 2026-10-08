"use client";

import { DifficultyLevel } from "@/lib/schemas/mission";
import { ShieldAlert, Sparkles, Mountain } from "lucide-react";

interface DifficultyOption {
  level: DifficultyLevel;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DIFFICULTIES: DifficultyOption[] = [
  {
    level: "easy",
    label: "Easy",
    desc: "Gentle sensory focus, flat accessible paths",
    icon: Sparkles,
  },
  {
    level: "moderate",
    label: "Moderate",
    desc: "Active exploration & multi-layered observations",
    icon: Mountain,
  },
  {
    level: "challenging",
    label: "Challenging",
    desc: "Curious scouting, uncharted paths & high attentiveness",
    icon: ShieldAlert,
  },
];

interface DifficultySelectorProps {
  selected: DifficultyLevel;
  onSelect: (level: DifficultyLevel) => void;
  disabled?: boolean;
}

export function DifficultySelector({ selected, onSelect, disabled }: DifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90">
          Step 3: Outdoor Challenge Level
        </label>
        <span className="text-xs text-muted font-mono capitalize">{selected}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {DIFFICULTIES.map((diff) => {
          const isSelected = selected === diff.level;
          const Icon = diff.icon;

          return (
            <button
              key={diff.level}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(diff.level)}
              className={`p-3 rounded-xl flex items-center sm:flex-col sm:text-center text-left gap-3 transition-all outline-none
                ${
                  isSelected
                    ? "bg-[#112a1d] border-2 border-emerald-400 text-white shadow-md shadow-emerald-950/60 font-semibold"
                    : "bg-[#0b1b13]/80 hover:bg-[#0f241a] border border-[#1b3a28] text-[#9bb0a3]"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-95"}
              `}
              aria-pressed={isSelected}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isSelected ? "bg-emerald-400/20 text-emerald-300" : "bg-[#142e20] text-emerald-500/70"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">{diff.label}</span>
                <span className="text-[11px] text-[#8aa193] block leading-tight">{diff.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
