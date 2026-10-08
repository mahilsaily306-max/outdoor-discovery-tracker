"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ActivityType,
  DifficultyLevel,
  JournalReflection,
  Mission,
  MissionRequest,
} from "@/lib/schemas/mission";
import { generateSafeMission } from "@/lib/ai";
import {
  DEFAULT_SETTINGS,
  getActiveMissionId,
  getMission,
  getUserSettings,
  saveActiveMissionId,
  UserSettings,
} from "@/lib/storage/db";
import { ActivitySelector } from "@/components/ActivitySelector";
import { DurationSelector } from "@/components/DurationSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { MissionCard } from "@/components/MissionCard";
import { ScreenAwayMode } from "@/components/ScreenAwayMode";
import { MissionCompletionFlow } from "@/components/MissionCompletionFlow";
import { OutdoorJournalCard } from "@/components/OutdoorJournalCard";
import { HistoryView } from "@/components/HistoryView";
import { ProviderStatusPill } from "@/components/ProviderStatusPill";
import { SettingsModal } from "@/components/SettingsModal";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import {
  Sparkles,
  AlertCircle,
  History,
  Shield,
  Leaf,
  Loader2,
  Clock,
  Play,
  Layers,
} from "lucide-react";

type ViewMode = "home" | "preview" | "active" | "completing" | "journal" | "history";

export default function Home() {
  // Config state
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");

  // Mission creation form state
  const [activity, setActivity] = useState<ActivityType>("walk");
  const [duration, setDuration] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("easy");
  const [environmentHint, setEnvironmentHint] = useState<string>("");

  // Flow objects
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [actualMinutesOutside, setActualMinutesOutside] = useState<number>(30);
  const [completedReflection, setCompletedReflection] = useState<JournalReflection | null>(null);

  // Recovery & error states
  const [recoveredActiveMission, setRecoveredActiveMission] = useState<Mission | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ollamaFailed, setOllamaFailed] = useState(false);

  // Initialize settings & check for active mission in progress on reload
  useEffect(() => {
    getUserSettings().then((s) => setSettings(s));

    getActiveMissionId().then(async (activeId) => {
      if (activeId) {
        const m = await getMission(activeId);
        if (m && (m.status === "active" || m.status === "created")) {
          setRecoveredActiveMission(m);
        }
      }
    });
  }, []);

  const handleCreateMission = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setOllamaFailed(false);
    setGenerationStep("Analyzing outdoor environment...");

    const request: MissionRequest = {
      activity,
      duration,
      difficulty,
      environmentHint: environmentHint.trim() || undefined,
    };

    try {
      const stepTimer = setTimeout(() => {
        setGenerationStep("Formulating mindful field objectives...");
      }, 700);

      const result = await generateSafeMission(request, {
        providerId: settings.activeProviderId,
        ollamaBaseUrl: settings.ollamaBaseUrl,
        ollamaModel: settings.ollamaModel,
      });

      clearTimeout(stepTimer);
      setCurrentMission(result.mission);
      setViewMode("preview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      if (settings.activeProviderId === "ollama") {
        setOllamaFailed(true);
        setErrorMessage(
          `Ollama was unreachable or timed out (${msg}). Switch to Demo Mode for instant testing, or check your local Ollama server.`
        );
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleSwitchToDemoAndRetry = async () => {
    setSettings((prev) => ({ ...prev, activeProviderId: "demo" }));
    setOllamaFailed(false);
    setErrorMessage(null);

    setIsGenerating(true);
    setGenerationStep("Switched to Demo Engine. Generating outdoor mission...");

    try {
      const result = await generateSafeMission(
        { activity, duration, difficulty, environmentHint: environmentHint || undefined },
        { providerId: "demo" }
      );
      setCurrentMission(result.mission);
      setViewMode("preview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartMission = (mission: Mission) => {
    setCurrentMission(mission);
    setRecoveredActiveMission(null);
    setViewMode("active");
  };

  const handleMissionFinished = (completedMission: Mission, actualMinutes: number) => {
    setCurrentMission(completedMission);
    setActualMinutesOutside(actualMinutes);
    setViewMode("completing");
  };

  const handleReflectionReady = (reflection: JournalReflection, updatedMission: Mission) => {
    setCurrentMission(updatedMission);
    setCompletedReflection(reflection);
    setViewMode("journal");
  };

  const handleResumeRecoveredMission = () => {
    if (recoveredActiveMission) {
      setCurrentMission(recoveredActiveMission);
      setRecoveredActiveMission(null);
      setViewMode("active");
    }
  };

  const handleDiscardRecoveredMission = async () => {
    await saveActiveMissionId(null);
    setRecoveredActiveMission(null);
  };

  const resetToHome = () => {
    setCurrentMission(null);
    setCompletedReflection(null);
    setViewMode("home");
  };

  return (
    <div
      className={`min-h-full flex flex-col relative transition-colors ${
        settings.highContrastMode
          ? "bg-[#030a06] text-white"
          : "bg-[#07120c] text-[#f0fdf4] bg-radial-glow"
      }`}
    >
      {/* Background Ambience Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#142e20]/80 bg-[#07120c]/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={resetToHome}
            className="flex items-center gap-2.5 text-left outline-none cursor-pointer"
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-md shadow-emerald-950">
              <Image
                src="/icon.svg"
                alt="VERDA icon"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                VERDA
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                Touch Grass
              </span>
            </div>
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsArchitectureOpen(true)}
              className="p-2 rounded-full border border-[#1b3e2b] bg-[#0d2218] hover:bg-[#142e20] text-[#91a89c] hover:text-white transition-colors cursor-pointer"
              title="How VERDA Works & Architecture"
              aria-label="How VERDA Works"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("history")}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                viewMode === "history"
                  ? "bg-emerald-500 text-black border-emerald-400"
                  : "bg-[#0d2218] hover:bg-[#142e20] border-[#1b3e2b] text-[#91a89c] hover:text-white"
              }`}
              title="View outdoor history & streaks"
              aria-label="View history"
            >
              <History className="w-4 h-4" />
            </button>

            <ProviderStatusPill
              providerId={settings.activeProviderId}
              modelName={settings.ollamaModel}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 flex flex-col">
        {/* Recovery Alert for Active Mission in Progress */}
        {recoveredActiveMission && viewMode === "home" && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm text-white block">
                  Active Mission in Progress
                </span>
                <p className="text-xs text-[#a2baa8] leading-relaxed">
                  You started &ldquo;{recoveredActiveMission.title}&rdquo; earlier.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResumeRecoveredMission}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#022c22] font-black text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Screen-Away Mode</span>
              </button>
              <button
                type="button"
                onClick={handleDiscardRecoveredMission}
                className="py-2 px-3 rounded-xl bg-[#0d2218] text-[#8ea598] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View Mode Switching */}
        {viewMode === "history" ? (
          <HistoryView onBack={resetToHome} />
        ) : viewMode === "active" && currentMission ? (
          <ScreenAwayMode
            mission={currentMission}
            highContrast={settings.highContrastMode}
            onMissionFinished={handleMissionFinished}
          />
        ) : viewMode === "completing" && currentMission ? (
          <MissionCompletionFlow
            mission={currentMission}
            actualMinutes={actualMinutesOutside}
            settings={settings}
            onReflectionReady={handleReflectionReady}
            onSettingsChange={(s) => setSettings(s)}
          />
        ) : viewMode === "journal" && currentMission && completedReflection ? (
          <OutdoorJournalCard
            mission={currentMission}
            reflection={completedReflection}
            onFinish={resetToHome}
            onOpenHistory={() => setViewMode("history")}
          />
        ) : viewMode === "preview" && currentMission ? (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Your Adventure is Ready
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Mission Briefing
              </h1>
            </div>

            <MissionCard
              mission={currentMission}
              onStartMission={handleStartMission}
              onDiscard={() => setViewMode("home")}
            />
          </div>
        ) : (
          /* View Mode: Home (Form to Create Mission) */
          <div className="space-y-7 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="text-center space-y-3 pt-2 pb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hacktoberfest 2026 &bull; Touch Grass AI</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                AI that gets out of your way.
              </h1>

              <p className="text-sm sm:text-base text-[#9fb3a6] max-w-md mx-auto leading-relaxed">
                Generate a personalized outdoor mission, pocket your phone, and return only when you are ready to reflect.
              </p>
            </div>

            {/* Error Banner / Ollama Fallback */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2.5 animate-in shake duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="flex-1 leading-relaxed">{errorMessage}</p>
                </div>

                {ollamaFailed && (
                  <button
                    type="button"
                    onClick={handleSwitchToDemoAndRetry}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Switch to Demo Mode (Guaranteed Local Generation)</span>
                  </button>
                )}
              </div>
            )}

            {/* Mission Form Card */}
            <div className="glass-panel-elevated rounded-3xl p-5 sm:p-7 space-y-6 border border-[#1b3d2a]">
              {/* Step 1: Activity */}
              <ActivitySelector
                selected={activity}
                onSelect={setActivity}
                disabled={isGenerating}
              />

              {/* Step 2: Duration */}
              <DurationSelector
                selected={duration}
                onSelect={setDuration}
                disabled={isGenerating}
              />

              {/* Step 3: Difficulty */}
              <DifficultySelector
                selected={difficulty}
                onSelect={setDifficulty}
                disabled={isGenerating}
              />

              {/* Optional Environmental Context */}
              <div className="space-y-2 pt-1 border-t border-[#163324]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#8ca094]">
                    Optional Environment Clue
                  </label>
                  <span className="text-[10px] text-[#6f8578]">Optional</span>
                </div>
                <input
                  type="text"
                  value={environmentHint}
                  onChange={(e) => setEnvironmentHint(e.target.value)}
                  disabled={isGenerating}
                  placeholder="e.g. City park with ponds, dense neighborhood trees, rainy afternoon..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#091710] border border-[#1b3a28] focus:border-emerald-500/80 text-sm text-white placeholder-[#587062] outline-none transition-colors"
                />
              </div>

              {/* Primary CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleCreateMission}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer
                    ${
                      isGenerating
                        ? "bg-[#142e20] text-emerald-400/80 cursor-wait"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#022c22] shadow-emerald-950/80 hover:scale-[1.01] active:scale-95"
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{generationStep || "Generating Mission..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>CREATE MY MISSION</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Outdoor UX Guarantee Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#6e8577] text-center pt-2">
              <Shield className="w-4 h-4 text-emerald-500/80" />
              <span>Local-first storage &bull; Private on-device &bull; Zero attention traps</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#12281c] py-4 mt-auto">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-[11px] text-[#657d70]">
          <div className="flex items-center gap-3">
            <span>VERDA &bull; Hacktoberfest 2026 Week 1</span>
            <button
              type="button"
              onClick={() => setIsArchitectureOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              How it works
            </button>
          </div>
          <span>Touch Grass</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsSaved={(updated) => setSettings(updated)}
      />

      {/* Architecture & How It Works Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        onOpenSettings={() => {
          setIsArchitectureOpen(false);
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}
