"use client";

import { useState } from "react";
import Image from "next/image";
import { JournalReflection, Mission } from "@/lib/schemas/mission";
import {
  Share2,
  Check,
  Compass,
  Sparkles,
  ArrowRight,
  Clock,
  Leaf,
  Smile,
  Copy,
} from "lucide-react";

interface OutdoorJournalCardProps {
  mission: Mission;
  reflection: JournalReflection;
  onFinish: () => void;
  onOpenHistory?: () => void;
}

export function OutdoorJournalCard({
  mission,
  reflection,
  onFinish,
  onOpenHistory,
}: OutdoorJournalCardProps) {
  const [copied, setCopied] = useState(false);

  const outdoorMinutes = mission.actualOutdoorMinutes || mission.duration;
  const dateFormatted = new Date(mission.completedAt || mission.createdAt).toLocaleDateString(
    undefined,
    { weekday: "long", month: "short", day: "numeric" }
  );

  const handleShare = async () => {
    const discoveriesCount = mission.discoveries?.length || 0;
    const shareText = `🌿 VERDA\n${outdoorMinutes} minutes outside.\n${mission.title}.\n${discoveriesCount} ${discoveriesCount === 1 ? "discovery" : "discoveries"}.\n\nReflection: "${reflection.reflection}"\n\nAI that gets out of your way.`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "VERDA — Today Outside",
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-panel-elevated rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1b3e2b] pb-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 block mb-1">
            Today Outside 🌿
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {mission.title}
          </h1>
          <p className="text-xs text-[#8ca495] mt-1">
            {dateFormatted} &bull; {outdoorMinutes} minutes in the real world
          </p>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="p-2.5 rounded-2xl bg-[#122c1f] hover:bg-[#183a29] border border-emerald-600/40 text-emerald-300 hover:text-white transition-all cursor-pointer shadow-md"
          title="Share Outdoor Journal"
          aria-label="Share Outdoor Journal"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {copied && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 text-center font-medium animate-in fade-in">
          ✓ Copied outdoor journal card to clipboard!
        </div>
      )}

      {/* Summary Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#10271b] to-[#0a1b12] border border-[#1b3a28] space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          Field Summary
        </span>
        <p className="text-sm font-medium text-white leading-relaxed">
          {reflection.summary}
        </p>
      </div>

      {/* Discoveries Highlight */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Field Discoveries & Moments
        </h2>

        <div className="space-y-2">
          {reflection.discoveriesHighlight.map((highlight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#0b1c13] border border-[#1a3b28] flex items-start gap-2.5 text-xs text-[#d1fae5] leading-relaxed"
            >
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">&bull;</span>
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Gallery (if photos captured) */}
      {mission.discoveries && mission.discoveries.some((d) => d.photoDataUrl) && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Field Photographs ({mission.discoveries.filter((d) => d.photoDataUrl).length})
          </h2>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mission.discoveries
              .filter((d) => d.photoDataUrl)
              .map((d) => (
                <div
                  key={d.id}
                  className="relative h-28 rounded-xl overflow-hidden border border-emerald-500/30 group"
                >
                  <Image
                    src={d.photoDataUrl!}
                    alt={d.note}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white truncate">{d.note}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Deep Reflection */}
      <div className="p-5 rounded-2xl bg-[#091710] border border-[#1c3e2b] space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Reflection</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Smile className="w-3 h-3" />
            <span>{reflection.mood}</span>
          </span>
        </div>

        <p className="text-sm text-[#b2c8bb] leading-relaxed italic">
          &ldquo;{reflection.reflection}&rdquo;
        </p>
      </div>

      {/* Next Adventure Idea */}
      <div className="p-4 rounded-2xl bg-[#0b1f15] border border-teal-500/30 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Next Adventure Prompt</span>
        </span>
        <p className="text-xs text-[#a3c4b0] leading-relaxed">
          {reflection.nextRecommendation}
        </p>
      </div>

      {/* Footer CTAs */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onFinish}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#022c22] font-black text-sm tracking-wide shadow-lg shadow-emerald-950/80 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>DONE &bull; RETURN HOME</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="py-3 px-4 rounded-2xl bg-[#0c1f14] hover:bg-[#122c1d] border border-[#1b3a28] text-xs font-bold text-[#8fa799] hover:text-white transition-colors cursor-pointer text-center"
          >
            View in History
          </button>
        )}
      </div>
    </div>
  );
}
