"use client";

import { useEffect, useState, useRef } from "react";
import { Discovery, Mission } from "@/lib/schemas/mission";
import { updateMissionStatus, addDiscoveryToMission, saveActiveMissionId } from "@/lib/storage/db";
import { ScreenWakeLockManager } from "@/lib/utils/wake-lock";
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from "@/lib/utils/speech";
import { DiscoveryRecorderModal } from "./DiscoveryRecorderModal";
import {
  Volume2,
  VolumeX,
  Camera,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
} from "lucide-react";

interface ScreenAwayModeProps {
  mission: Mission;
  highContrast?: boolean;
  onMissionFinished: (completedMission: Mission, actualMinutes: number) => void;
}

export function ScreenAwayMode({
  mission,
  highContrast = false,
  onMissionFinished,
}: ScreenAwayModeProps) {
  // Timestamp-based drift-free timer calculation
  const startedAtMs = useRef<number>(
    mission.startedAt ? new Date(mission.startedAt).getTime() : Date.now()
  );
  const targetDurationSeconds = mission.duration * 60;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const elapsed = Math.floor((Date.now() - startedAtMs.current) / 1000);
    return Math.max(0, targetDurationSeconds - elapsed);
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isOledMode, setIsOledMode] = useState(false);
  const [discoveries, setDiscoveries] = useState<Discovery[]>(mission.discoveries || []);

  const wakeLockManager = useRef<ScreenWakeLockManager>(new ScreenWakeLockManager());

  // Initialize mission in storage as active
  useEffect(() => {
    const nowIso = new Date(startedAtMs.current).toISOString();
    updateMissionStatus(mission.id, "active", { startedAt: nowIso }).catch(() => {});
    saveActiveMissionId(mission.id).catch(() => {});

    // Request screen wake lock
    wakeLockManager.current.request().catch(() => {});

    const onVisibility = () => {
      wakeLockManager.current.handleVisibilityChange();
      // Recalculate remaining seconds immediately on wake
      const elapsed = Math.floor((Date.now() - startedAtMs.current) / 1000);
      setSecondsRemaining(Math.max(0, targetDurationSeconds - elapsed));
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      wakeLockManager.current.release().catch(() => {});
      stopSpeaking();
    };
  }, [mission.id, targetDurationSeconds]);

  // Precise interval loop
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtMs.current) / 1000);
      const remaining = Math.max(0, targetDurationSeconds - elapsed);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        handleCompleteMission(mission.duration);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDurationSeconds, mission.duration]);

  const handleCompleteMission = (elapsedMinutes: number) => {
    const finalMinutes = Math.max(1, elapsedMinutes);
    const updatedMission: Mission = {
      ...mission,
      status: "completed",
      completedAt: new Date().toISOString(),
      actualOutdoorMinutes: finalMinutes,
      discoveries,
    };
    saveActiveMissionId(null).catch(() => {});
    onMissionFinished(updatedMission, finalMinutes);
  };

  const handleEndEarly = () => {
    const elapsedSeconds = Math.floor((Date.now() - startedAtMs.current) / 1000);
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    setShowEndConfirm(false);
    handleCompleteMission(elapsedMinutes);
  };

  const handleAudioBriefing = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const objectivesText = mission.objectives.map((o) => o.title).join(". ");
    const script = `Your mission is ${mission.title}. ${mission.description}. Objectives: ${objectivesText}. Remember: ${mission.screenAwayPrompt}. Put your phone away now.`;
    await speakText(script);
    setIsSpeaking(false);
  };

  const handleAddDiscovery = async (discovery: Discovery) => {
    await addDiscoveryToMission(mission.id, discovery).catch(() => {});
    setDiscoveries((prev) => [...prev, discovery]);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className={`min-h-[85vh] w-full max-w-lg mx-auto flex flex-col items-center justify-between p-6 sm:p-8 transition-colors select-none ${
        isOledMode
          ? "bg-black text-white"
          : highContrast
          ? "bg-[#040c07] text-[#f0fdf4] border-2 border-emerald-400 rounded-3xl"
          : "glass-panel-elevated rounded-3xl border border-emerald-500/30 text-white"
      }`}
    >
      {/* Top Status Bar */}
      <div className="w-full flex items-center justify-between pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>Mission Active</span>
        </div>

        {/* OLED & Audio Toggles */}
        <div className="flex items-center gap-2">
          {isSpeechSynthesisSupported() && (
            <button
              type="button"
              onClick={handleAudioBriefing}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isSpeaking
                  ? "bg-emerald-500 text-black border-emerald-400"
                  : "bg-[#0c1f15] hover:bg-[#122e20] text-emerald-300 border-[#1c3f2b]"
              }`}
              title={isSpeaking ? "Mute audio briefing" : "Listen to mission audio briefing"}
              aria-label="Audio Briefing"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOledMode(!isOledMode)}
            className="p-2 rounded-full bg-[#0c1f15] hover:bg-[#122e20] text-[#90a89a] hover:text-white border border-[#1c3f2b] transition-colors cursor-pointer"
            title="Toggle OLED True Black Power Saver"
            aria-label="OLED Mode"
          >
            {isOledMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Radical Screen-Away Core */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto py-6">
        <div className="p-5 rounded-full bg-[#0f2a1b] border border-emerald-500/40 text-emerald-400 shadow-xl shadow-emerald-950/80 animate-soft-pulse">
          <EyeOff className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        {/* Large Outdoor Timer */}
        <div className="space-y-1">
          <div className="font-mono text-6xl sm:text-7xl font-black text-emerald-300 tracking-tight">
            {timeFormatted}
          </div>
          <p className="text-xs uppercase tracking-widest text-[#7da08c] font-semibold">
            Remaining Outdoor Time
          </p>
        </div>

        {/* High-Impact Outdoor Mandate */}
        <div className="space-y-2 max-w-sm px-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            Your Phone Isn&apos;t Needed.
          </h2>
          <p className="text-sm sm:text-base text-emerald-200/90 leading-relaxed italic">
            &ldquo;{mission.screenAwayPrompt}&rdquo;
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Go Touch Grass 🌿
          </span>
        </div>
      </div>

      {/* Field Actions / Quick Discovery */}
      <div className="w-full space-y-3 pb-1">
        {/* Quick Discovery Button (Doesn't interrupt active session) */}
        <button
          type="button"
          onClick={() => setIsDiscoveryModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#0e2418] hover:bg-[#133020] border border-emerald-600/40 text-white font-bold text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>
            {discoveries.length > 0
              ? `RECORD ANOTHER DISCOVERY (${discoveries.length} SAVED)`
              : "SNAP PHOTO OR VOICE DISCOVERY"}
          </span>
        </button>

        {/* End Mission Button */}
        <button
          type="button"
          onClick={() => setShowEndConfirm(true)}
          className="w-full py-3 rounded-xl bg-[#09160f] hover:bg-[#112419] border border-[#1a3826] text-[#8aa393] hover:text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
        >
          End Mission Early
        </button>
      </div>

      {/* End Early Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm glass-panel-elevated rounded-3xl p-6 space-y-4 border border-emerald-500/40 text-center">
            <div className="p-3 mx-auto w-12 h-12 rounded-full bg-[#122b1c] text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">End this mission?</h3>
              <p className="text-xs text-[#9bb0a3] leading-relaxed">
                Every bit outside counts! You can immediately record any observations and reflect on your time outdoors.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleEndEarly}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] font-black text-xs tracking-wider uppercase transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                End & Record Reflections
              </button>
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#8ba294] hover:text-white transition-colors cursor-pointer"
              >
                Keep Walking (Continue)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Capture Modal */}
      <DiscoveryRecorderModal
        isOpen={isDiscoveryModalOpen}
        missionId={mission.id}
        onClose={() => setIsDiscoveryModalOpen(false)}
        onSave={handleAddDiscovery}
      />
    </div>
  );
}
