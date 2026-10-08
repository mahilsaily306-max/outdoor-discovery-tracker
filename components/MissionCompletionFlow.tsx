"use client";

import { useState } from "react";
import Image from "next/image";
import { Discovery, JournalReflection, Mission } from "@/lib/schemas/mission";
import { generateSafeReflection } from "@/lib/ai";
import { saveMission, UserSettings } from "@/lib/storage/db";
import { DiscoveryRecorderModal } from "./DiscoveryRecorderModal";
import {
  CheckCircle2,
  Circle,
  Camera,
  Plus,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  Leaf,
  Tag,
} from "lucide-react";

interface MissionCompletionFlowProps {
  mission: Mission;
  actualMinutes: number;
  settings: UserSettings;
  onReflectionReady: (reflection: JournalReflection, updatedMission: Mission) => void;
  onSettingsChange: (settings: UserSettings) => void;
}

export function MissionCompletionFlow({
  mission,
  actualMinutes,
  settings,
  onReflectionReady,
  onSettingsChange,
}: MissionCompletionFlowProps) {
  const [objectives, setObjectives] = useState(mission.objectives);
  const [discoveries, setDiscoveries] = useState<Discovery[]>(mission.discoveries || []);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  const toggleObjective = (id: string) => {
    setObjectives((prev) =>
      prev.map((o) => (o.id === id ? { ...o, completed: !o.completed } : o))
    );
  };

  const handleAddDiscovery = async (discovery: Discovery) => {
    const updated = [...discoveries, discovery];
    setDiscoveries(updated);
    await saveMission({ ...mission, discoveries: updated }).catch(() => {});
  };

  const handleGenerateReflection = async (providerOverride?: "demo" | "ollama") => {
    setIsGeneratingReflection(true);
    setReflectionError(null);

    const targetProvider = providerOverride || settings.activeProviderId;

    try {
      const result = await generateSafeReflection(
        {
          missionId: mission.id,
          activity: mission.activity,
          plannedDuration: mission.duration,
          actualDuration: actualMinutes,
          objectives: objectives.map((o) => ({ title: o.title, completed: o.completed })),
          discoveries: discoveries.map((d) => ({
            type: d.type,
            note: d.note,
            tag: d.tag,
          })),
        },
        {
          providerId: targetProvider,
          ollamaBaseUrl: settings.ollamaBaseUrl,
          ollamaModel: settings.ollamaModel,
        }
      );

      const updatedMission: Mission = {
        ...mission,
        status: "completed",
        actualOutdoorMinutes: actualMinutes,
        objectives,
        discoveries,
        reflection: result.reflection,
      };

      await saveMission(updatedMission);
      onReflectionReady(result.reflection, updatedMission);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setReflectionError(msg);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel-elevated rounded-3xl p-5 sm:p-7 space-y-6 border border-emerald-500/30 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-[#1b3e2b] pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          <span>Mission Completed</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Welcome Back Outside 🌿
        </h1>

        <div className="flex items-center justify-center gap-4 text-xs text-[#a2b8ab] pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actualMinutes} minutes recorded</span>
          </span>
          <span>&bull;</span>
          <span className="capitalize text-emerald-300 font-semibold">
            {mission.activity.replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Field Objectives Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Check Off What You Discovered
          </h2>
          <span className="text-xs text-[#7f998b]">
            {objectives.filter((o) => o.completed).length} of {objectives.length} completed
          </span>
        </div>

        <div className="space-y-2">
          {objectives.map((obj) => (
            <button
              key={obj.id}
              type="button"
              onClick={() => toggleObjective(obj.id)}
              className={`w-full p-3.5 rounded-xl text-left flex items-start gap-3 transition-all border outline-none cursor-pointer
                ${
                  obj.completed
                    ? "bg-[#0c2217] border-emerald-500/50 text-emerald-200"
                    : "bg-[#091710] hover:bg-[#0e2418] border-[#183a27] text-[#a4bcae]"
                }
              `}
            >
              <div className="mt-0.5 shrink-0">
                {obj.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-[#5c7768]" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className={`text-sm font-semibold block leading-tight ${obj.completed ? "text-white" : "text-[#b2c8bb]"}`}>
                  {obj.title}
                </span>
                <p className="text-xs text-[#789383]">{obj.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Discoveries Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Recorded Observations ({discoveries.length})
          </h2>

          <button
            type="button"
            onClick={() => setIsDiscoveryModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Observation</span>
          </button>
        </div>

        {discoveries.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#091710] border border-[#1b3a28] text-center space-y-2">
            <p className="text-xs text-[#8ca094]">
              Notice something interesting outside and save it here.
            </p>
            <button
              type="button"
              onClick={() => setIsDiscoveryModalOpen(true)}
              className="py-2 px-3 rounded-xl bg-[#132c1e] text-xs font-bold text-emerald-300 hover:bg-[#193a28] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Add Quick Discovery</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {discoveries.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl bg-[#0b1c13] border border-[#1b3c29] flex items-center gap-3"
              >
                {d.photoDataUrl ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-500/30">
                    <Image
                      src={d.photoDataUrl}
                      alt="Discovery"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#142e20] text-emerald-400 shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-white block truncate">
                    {d.note}
                  </span>
                  <span className="text-[10px] text-[#7b9686] capitalize">
                    {d.tag} &bull; {d.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error state with fallback */}
      {reflectionError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{reflectionError}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              onSettingsChange({ ...settings, activeProviderId: "demo" });
              handleGenerateReflection("demo");
            }}
            className="w-full py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with Demo Engine (Zero Setup)</span>
          </button>
        </div>
      )}

      {/* Primary Action */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isGeneratingReflection}
          onClick={() => handleGenerateReflection()}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer
            ${
              isGeneratingReflection
                ? "bg-[#142e20] text-emerald-400/80 cursor-wait"
                : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#022c22] shadow-emerald-950/80 hover:scale-[1.01] active:scale-95"
            }
          `}
        >
          {isGeneratingReflection ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Synthesizing Outdoor Journal with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>GENERATE OUTDOOR JOURNAL REFLECTION</span>
            </>
          )}
        </button>
      </div>

      {/* Modal */}
      <DiscoveryRecorderModal
        isOpen={isDiscoveryModalOpen}
        missionId={mission.id}
        onClose={() => setIsDiscoveryModalOpen(false)}
        onSave={handleAddDiscovery}
      />
    </div>
  );
}
