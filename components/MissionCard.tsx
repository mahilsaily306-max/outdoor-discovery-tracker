"use client";

import { useState } from "react";
import { Mission } from "@/lib/schemas/mission";
import { Clock, Mountain, ShieldCheck, CheckCircle2, Circle, ArrowRight, RotateCcw, Smartphone, Cpu } from "lucide-react";

interface MissionCardProps {
  mission: Mission;
  onStartMission: (mission: Mission) => void;
  onDiscard: () => void;
}

export function MissionCard({ mission, onStartMission, onDiscard }: MissionCardProps) {
  const [objectives, setObjectives] = useState(mission.objectives);

  const toggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, completed: !obj.completed } : obj))
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel-elevated rounded-3xl p-5 sm:p-7 space-y-6 border border-emerald-500/30 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b3d2b] pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            {mission.activity.replace("-", " ")}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#11291d] text-[#a1b7aa]">
            <Clock className="w-3 h-3 text-emerald-400" />
            {mission.duration}m
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#11291d] text-[#a1b7aa] capitalize">
            <Mountain className="w-3 h-3 text-amber-400" />
            {mission.difficulty}
          </span>
        </div>

        {/* AI Model Badge */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-[#07150e] text-[#6ee7b7] border border-emerald-800/40">
          <Cpu className="w-3 h-3" />
          <span>{mission.provider === "ollama" ? `Ollama (${mission.modelName})` : "Demo AI Engine"}</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          {mission.title}
        </h2>
        <p className="text-sm sm:text-base text-[#b4cbbe] leading-relaxed">
          {mission.description}
        </p>
      </div>

      {/* Screen-Away Directive (The Core Philosophy) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#122e20] to-[#0b1f15] border border-emerald-500/40 p-4 sm:p-5 shadow-inner">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300 shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
              Screen-Away Mandate
            </span>
            <blockquote className="text-sm font-medium italic text-emerald-100/90 leading-snug">
              &ldquo;{mission.screenAwayPrompt}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>

      {/* Mission Objectives */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider uppercase text-emerald-400/90">
            Field Objectives
          </h3>
          <span className="text-xs text-[#7d9386]">
            {objectives.filter((o) => o.completed).length} of {objectives.length} previewed
          </span>
        </div>

        <div className="space-y-2">
          {objectives.map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => toggleObjective(obj.id)}
              className={`w-full p-3.5 rounded-xl text-left flex items-start gap-3 transition-all border outline-none
                ${
                  obj.completed
                    ? "bg-[#0b1c13]/70 border-emerald-500/40 text-emerald-300/80"
                    : "bg-[#0d2218]/90 hover:bg-[#112a1e] border-[#1f422e] text-white"
                }
              `}
            >
              <div className="mt-0.5 shrink-0">
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-[#5e7869]" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className={`text-sm font-semibold block leading-tight ${obj.completed ? "line-through text-[#6f8578]" : "text-white"}`}>
                  {obj.title}
                </span>
                <p className="text-xs text-[#9bb0a3] leading-relaxed">
                  {obj.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Safety Checklist */}
      <div className="p-4 rounded-2xl bg-[#091710] border border-[#1b3a28] space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Outdoor Safety Checklist</span>
        </div>
        <ul className="space-y-1.5">
          {mission.safetyChecklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-[#a2b8ab] leading-relaxed">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onStartMission({ ...mission, objectives })}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#022c22] font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <span>START MISSION</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={onDiscard}
          className="py-3.5 px-4 rounded-2xl bg-[#0d2218] hover:bg-[#122c20] border border-[#1f422e] text-[#a4bcae] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Mission</span>
        </button>
      </div>
    </div>
  );
}
