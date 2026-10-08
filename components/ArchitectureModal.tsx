"use client";

import {
  X,
  Cpu,
  Layers,
  Shield,
  Server,
  Sparkles,
  Database,
  ArrowRight,
  EyeOff,
  Compass,
} from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export function ArchitectureModal({
  isOpen,
  onClose,
  onOpenSettings,
}: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto border border-emerald-500/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b3d2b] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                How VERDA Works
              </h2>
              <p className="text-xs text-[#8ca094]">
                Architecture &bull; Open-Weight AI &bull; Screen-Away Philosophy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#12281c] text-[#8ca094] hover:text-white transition-colors cursor-pointer"
            aria-label="Close architecture modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Philosophy Banner */}
        <div className="p-4 rounded-2xl bg-[#091a11] border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <EyeOff className="w-4 h-4" />
            <span>The Screen-Away Paradigm</span>
          </div>
          <p className="text-xs text-[#d1fae5] leading-relaxed">
            Most modern AI apps compete for continuous screen time. VERDA uses AI briefly to formulate an intentional, sensory reason to step outside, then demands that you pocket the phone. The physical world becomes the real experience.
          </p>
        </div>

        {/* Open AI Architecture Diagram */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Provider Architecture</span>
          </h3>

          <div className="p-4 rounded-2xl bg-[#06120b] border border-[#163324] font-mono text-[11px] leading-relaxed text-[#9fb8a9] overflow-x-auto whitespace-pre">
{`                     VERDA (Client Next.js PWA)
                                 │
                                 ▼
                       AIProvider Abstraction
                    (@/lib/ai/types.ts: AIProvider)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
           OllamaProvider                  DemoProvider
      (http://127.0.0.1:11434)        (Zero-Setup Local Logic)
                 │                               │
       Open-Weight Models              Dynamic Heuristics
     (Gemma 2 2B / Llama 3.2)         (Offline Judging Default)
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     Zod Schema Output Guard
                                 ▼
                     Deterministic Safety Check
                    (Rejects Hazards/Trespassing)
                                 ▼
                     Client IndexedDB Storage`}
          </div>
        </div>

        {/* Why Open-Weight AI Matters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Why Open Innovation Matters in Nature</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#08170f] border border-[#163324] space-y-1">
              <span className="text-xs font-bold text-white block">Local Trail Inference</span>
              <p className="text-[11px] text-[#8ca094] leading-relaxed">
                Run models on laptops or local daemons without requiring high-speed cell service in remote parks.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#08170f] border border-[#163324] space-y-1">
              <span className="text-xs font-bold text-white block">Zero Vendor Lock-in</span>
              <p className="text-[11px] text-[#8ca094] leading-relaxed">
                Freely swap between open weights (Gemma 2, Llama 3.2, Mistral, Qwen) using clean provider abstractions.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#08170f] border border-[#163324] space-y-1">
              <span className="text-xs font-bold text-white block">Private By Design</span>
              <p className="text-[11px] text-[#8ca094] leading-relaxed">
                Photos, voice recordings, and reflections stay on your device in IndexedDB. No cloud user accounts.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#08170f] border border-[#163324] space-y-1">
              <span className="text-xs font-bold text-white block">Safety Guardrails</span>
              <p className="text-[11px] text-[#8ca094] leading-relaxed">
                Strict client-side heuristics intercept hazardous missions (trespassing, cliffs, wildlife feeding).
              </p>
            </div>
          </div>
        </div>

        {/* Local-First Storage Stack */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Local Storage Model</span>
          </h3>

          <div className="p-3.5 rounded-2xl bg-[#08170f] border border-[#163324] text-xs text-[#9bb3a4] space-y-1.5">
            <p>
              IndexedDB (<code className="text-emerald-300">verda_db</code>) maintains local stores for:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li><strong className="text-white">missions:</strong> Generated objectives, difficulty, and state machine transitions.</li>
              <li><strong className="text-white">discoveries:</strong> Canvas-compressed JPEG photos and voice notes.</li>
              <li><strong className="text-white">reflections:</strong> Synthesized debriefs and next adventure prompts.</li>
              <li><strong className="text-white">activeMissionId:</strong> Crash/refresh recovery key.</li>
            </ul>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-2 flex items-center justify-between border-t border-[#1b3d2b]">
          {onOpenSettings ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-4 py-2 rounded-xl bg-[#12281c] hover:bg-[#183925] border border-emerald-600/30 text-xs font-bold text-emerald-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Configure AI Providers</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#022c22] font-black text-xs tracking-wide transition-all shadow-md cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
