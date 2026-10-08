"use client";

import { ProviderId } from "@/lib/ai/types";
import { Cpu, Settings } from "lucide-react";

interface ProviderStatusPillProps {
  providerId: ProviderId;
  modelName: string;
  isOllamaConnected?: boolean;
  onClick: () => void;
}

export function ProviderStatusPill({
  providerId,
  modelName,
  isOllamaConnected,
  onClick,
}: ProviderStatusPillProps) {
  const isOllama = providerId === "ollama";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a1810]/90 hover:bg-[#112a1d] border border-[#1b3a28] hover:border-emerald-600/50 text-xs text-[#a3b8ab] hover:text-white transition-all shadow-sm outline-none cursor-pointer"
      title="Click to configure AI Provider & Settings"
      aria-label="AI Provider Settings"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            isOllama
              ? isOllamaConnected
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
              : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
          }`}
        />
        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
      </div>

      <span className="font-medium text-[11px] tracking-tight">
        {isOllama ? `Local AI · Ollama (${modelName})` : "Demo AI"}
      </span>

      <Settings className="w-3 h-3 text-[#647c6e] group-hover:text-emerald-400 group-hover:rotate-45 transition-transform" />
    </button>
  );
}
