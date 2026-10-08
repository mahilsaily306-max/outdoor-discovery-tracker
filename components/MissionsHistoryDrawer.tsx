"use client";

import { useEffect, useState } from "react";
import { Mission } from "@/lib/schemas/mission";
import { getAllMissions, deleteMission } from "@/lib/storage/db";
import { X, Clock, Mountain, Trash2, ArrowRight, History, Compass } from "lucide-react";

interface MissionsHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMission: (mission: Mission) => void;
}

export function MissionsHistoryDrawer({
  isOpen,
  onClose,
  onSelectMission,
}: MissionsHistoryDrawerProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllMissions();
    setMissions(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteMission(id);
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#0a1811] border-l border-[#193a26] p-5 sm:p-6 flex flex-col space-y-4 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b3d2b] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Saved Outdoor Missions
              </h2>
              <p className="text-xs text-[#8ca094]">
                Stored locally on your device
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#12281c] text-[#8ca094] hover:text-white transition-colors cursor-pointer"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of missions */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#8ca094]">
              Loading saved missions...
            </div>
          ) : missions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-3 mx-auto w-12 h-12 rounded-full bg-[#122a1d] text-emerald-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">No missions yet</p>
              <p className="text-xs text-[#8ca094] max-w-xs mx-auto">
                Generate your first outdoor adventure on the home screen to save it here.
              </p>
            </div>
          ) : (
            missions.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMission(m);
                  onClose();
                }}
                className="group p-4 rounded-2xl bg-[#0d2218]/90 hover:bg-[#122c20] border border-[#1b3e2b] hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {m.activity.replace("-", " ")}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#8ea598]">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {m.duration}m
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, m.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#6f8578] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Delete mission"
                    aria-label="Delete mission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {m.title}
                </h3>

                <p className="text-xs text-[#9bb0a3] line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#163323] text-[11px] text-[#6d8577]">
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
