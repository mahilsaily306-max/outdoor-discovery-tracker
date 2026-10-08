"use client";

import { ActivityType } from "@/lib/schemas/mission";
import { Footprints, Compass, Feather, Sprout, Search, Zap } from "lucide-react";

interface ActivityOption {
  type: ActivityType;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const ACTIVITIES: ActivityOption[] = [
  {
    type: "walk",
    label: "Walk",
    tagline: "Canopy gaze & mindful neighborhood stride",
    icon: Footprints,
    accentColor: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/40",
  },
  {
    type: "run",
    label: "Run",
    tagline: "Natural cadence & fresh air elevation",
    icon: Zap,
    accentColor: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/40",
  },
  {
    type: "explore",
    label: "Explore",
    tagline: "Uncharted green alleys & hidden parks",
    icon: Compass,
    accentColor: "from-teal-500/20 to-cyan-500/10 text-teal-400 border-teal-500/40",
  },
  {
    type: "birding",
    label: "Birding",
    tagline: "Acoustic canopy & avian territory watch",
    icon: Feather,
    accentColor: "from-sky-500/20 to-indigo-500/10 text-sky-400 border-sky-500/40",
  },
  {
    type: "gardening",
    label: "Gardening",
    tagline: "Soil aroma, pollinators & botanical study",
    icon: Sprout,
    accentColor: "from-green-500/20 to-emerald-500/10 text-green-400 border-green-500/40",
  },
  {
    type: "nature-discovery",
    label: "Nature Discovery",
    tagline: "Micro textures, lichens & light geometry",
    icon: Search,
    accentColor: "from-lime-500/20 to-emerald-500/10 text-lime-400 border-lime-500/40",
  },
];

interface ActivitySelectorProps {
  selected: ActivityType;
  onSelect: (activity: ActivityType) => void;
  disabled?: boolean;
}

export function ActivitySelector({ selected, onSelect, disabled }: ActivitySelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider uppercase text-emerald-400/90">
          Step 1: Choose Your Outdoor Focus
        </label>
        <span className="text-xs text-muted font-mono">6 Activities</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {ACTIVITIES.map((act) => {
          const isSelected = selected === act.type;
          const Icon = act.icon;

          return (
            <button
              key={act.type}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(act.type)}
              className={`group relative flex flex-col items-start p-3.5 rounded-2xl text-left transition-all duration-200 outline-none
                ${
                  isSelected
                    ? "bg-gradient-to-br " + act.accentColor + " bg-[#11271c] shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/80 scale-[1.02]"
                    : "bg-[#0b1b13]/80 hover:bg-[#0f241a] border border-[#1b3a28] hover:border-emerald-600/40 opacity-85 hover:opacity-100"
                }
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-95"}
              `}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isSelected
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-[#142e20] text-emerald-500/80 group-hover:text-emerald-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                )}
              </div>

              <span className="font-semibold text-sm tracking-tight text-white mb-0.5">
                {act.label}
              </span>
              <p className="text-[11px] text-[#93a89c] line-clamp-2 leading-relaxed">
                {act.tagline}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
