"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Mission } from "@/lib/schemas/mission";
import { getAllMissions, deleteMission, calculateOutdoorStats, OutdoorStats } from "@/lib/storage/db";
import { OutdoorJournalCard } from "./OutdoorJournalCard";
import {
  Flame,
  Clock,
  Compass,
  Sparkles,
  Camera,
  Trash2,
  X,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";

interface HistoryViewProps {
  onBack: () => void;
}

export function HistoryView({ onBack }: HistoryViewProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<OutdoorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllMissions();
    setMissions(data);
    setStats(calculateOutdoorStats(data));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteMission(id);
    const updated = missions.filter((m) => m.id !== id);
    setMissions(updated);
    setStats(calculateOutdoorStats(updated));
    if (selectedMission?.id === id) setSelectedMission(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#1b3d2b] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <h1 className="text-lg font-bold text-white tracking-tight">
          Outdoor Journal & Streaks
        </h1>
      </div>

      {/* Stats & Streak Banner */}
      {stats && (
        <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white block leading-none">
                  {stats.currentStreakDays}-Day Streak
                </span>
                <span className="text-[11px] text-[#93a99c] font-medium">
                  {stats.currentStreakDays > 0 ? "Outdoor rhythm active" : "Step outside to start your streak"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-lg font-extrabold text-emerald-300 block leading-none">
                {stats.totalOutdoorMinutes}m
              </span>
              <span className="text-[10px] text-[#7d9687] uppercase tracking-wider">
                Total Outside
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#183925] text-center">
            <div className="p-2.5 rounded-xl bg-[#091710]">
              <span className="text-sm font-bold text-white block">
                {stats.totalCompletedSessions}
              </span>
              <span className="text-[10px] text-[#7d9687] uppercase">Sessions</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#091710]">
              <span className="text-sm font-bold text-white block">
                {stats.totalDiscoveries}
              </span>
              <span className="text-[10px] text-[#7d9687] uppercase">Discoveries</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#091710]">
              <span className="text-sm font-bold text-white block truncate capitalize">
                {stats.favoriteActivity}
              </span>
              <span className="text-[10px] text-[#7d9687] uppercase">Top Focus</span>
            </div>
          </div>
        </div>
      )}

      {/* Missions Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Adventure Timeline
          </h2>
          <span className="text-xs text-[#7f998b]">{missions.length} logged</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#8ca094]">
            Loading your outdoor history...
          </div>
        ) : missions.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center space-y-3 border border-[#1b3a28]">
            <div className="p-3 mx-auto w-12 h-12 rounded-full bg-[#122b1c] text-emerald-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">Your first adventure is waiting.</p>
            <p className="text-xs text-[#8ca094] max-w-sm mx-auto leading-relaxed">
              Complete an outdoor mission to record discoveries, photos, and AI reflections here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {missions.map((m) => {
              const dateStr = new Date(m.completedAt || m.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
              const outdoorTime = m.actualOutdoorMinutes || m.duration;
              const hasPhotos = m.discoveries && m.discoveries.some((d) => d.photoDataUrl);

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMission(m)}
                  className="group glass-panel rounded-2xl p-4 sm:p-5 border border-[#1b3a28] hover:border-emerald-500/50 transition-all cursor-pointer space-y-2.5 hover:bg-[#0d2217]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                        {m.activity.replace("-", " ")}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#9bb0a3]">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {outdoorTime}m
                      </span>
                      {m.status === "completed" && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#718b7c]">{dateStr}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, m.id)}
                        className="sm:opacity-0 sm:group-hover:opacity-100 opacity-70 p-1.5 text-[#647c6e] hover:text-red-400 transition-all cursor-pointer"
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                    {m.title}
                  </h3>

                  {m.reflection ? (
                    <p className="text-xs text-[#9eb5a7] line-clamp-2 leading-relaxed italic">
                      &ldquo;{m.reflection.reflection}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-[#8ca094] line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[#163323] text-[11px]">
                    <div className="flex items-center gap-3 text-[#7d9687]">
                      {m.discoveries && m.discoveries.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          {m.discoveries.length} discovery item(s)
                        </span>
                      )}
                      {hasPhotos && (
                        <span className="flex items-center gap-1">
                          <Camera className="w-3 h-3 text-teal-400" />
                          Photo saved
                        </span>
                      )}
                    </div>

                    <span className="text-emerald-400 font-bold group-hover:underline">
                      View Journal &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Mission Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <button
              type="button"
              onClick={() => setSelectedMission(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-[#112a1d] border border-emerald-500/40 text-white hover:bg-[#183a28] shadow-lg cursor-pointer"
              title="Close journal modal"
            >
              <X className="w-4 h-4" />
            </button>

            {selectedMission.reflection ? (
              <OutdoorJournalCard
                mission={selectedMission}
                reflection={selectedMission.reflection}
                onFinish={() => setSelectedMission(null)}
              />
            ) : (
              <div className="glass-panel-elevated rounded-3xl p-6 space-y-4 border border-emerald-500/30">
                <h2 className="text-xl font-bold text-white">{selectedMission.title}</h2>
                <p className="text-sm text-[#9eb5a7]">{selectedMission.description}</p>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase">Objectives</h3>
                  {selectedMission.objectives.map((o) => (
                    <div key={o.id} className="text-xs text-[#b8ccbf] flex items-center gap-2">
                      <span className="text-emerald-400">&bull;</span>
                      <span>{o.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
