"use client";

import { useEffect, useState } from "react";
import { Mission } from "@/lib/schemas/mission";
import { updateMissionStatus } from "@/lib/storage/db";
import { Compass, CheckCircle2, Circle, EyeOff, ArrowLeft } from "lucide-react";

interface MissionActivePlaceholderProps {
  mission: Mission;
  onExit: () => void;
}

export function MissionActivePlaceholder({ mission, onExit }: MissionActivePlaceholderProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(mission.duration * 60);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Mark as active in local DB
    updateMissionStatus(mission.id, "active").catch(() => {});
  }, [mission.id]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleComplete = async () => {
    await updateMissionStatus(mission.id, "completed").catch(() => {});
    onExit();
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-300">
      {/* Active Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span>Mission Active</span>
      </div>

      {/* Radical Screen-Away Message */}
      <div className="space-y-4">
        <div className="p-4 mx-auto w-16 h-16 rounded-full bg-[#112d1f] border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/80 animate-soft-pulse">
          <EyeOff className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Put Your Phone Away.
        </h1>
        <p className="text-base text-emerald-200/80 max-w-sm mx-auto leading-relaxed">
          &ldquo;{mission.screenAwayPrompt}&rdquo;
        </p>
      </div>

      {/* Glanceable Minimal Timer */}
      <div className="p-8 rounded-3xl bg-[#091710] border border-[#1b3a28] shadow-2xl w-full max-w-xs space-y-2">
        <div className="font-mono text-5xl sm:text-6xl font-black text-emerald-300 tracking-wider">
          {timeFormatted}
        </div>
        <p className="text-xs text-[#7f998b] font-medium uppercase tracking-wider">
          Remaining Outdoor Time
        </p>
      </div>

      {/* Glanceable Mission Card */}
      <div className="w-full text-left p-5 rounded-2xl bg-[#0d2218]/90 border border-[#1c3e2b] space-y-3">
        <div className="flex items-center justify-between border-b border-[#183324] pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {mission.title}
          </span>
          <span className="text-[11px] text-[#7f998b] capitalize">{mission.activity}</span>
        </div>

        <div className="space-y-2">
          {mission.objectives.map((obj) => (
            <div key={obj.id} className="flex items-start gap-2 text-xs text-[#b8ccbf]">
              <Circle className="w-3.5 h-3.5 text-emerald-500/70 shrink-0 mt-0.5" />
              <span>{obj.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Return / Finish CTA */}
      <div className="w-full pt-4 space-y-3">
        <button
          type="button"
          onClick={handleComplete}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#022c22] font-black text-sm tracking-wide shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I RETURNED &bull; LOG EXPERIENCES</span>
        </button>

        <button
          type="button"
          onClick={onExit}
          className="text-xs text-[#8ca094] hover:text-white flex items-center justify-center gap-1 mx-auto py-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
