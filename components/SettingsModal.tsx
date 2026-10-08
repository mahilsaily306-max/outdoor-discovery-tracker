"use client";

import { useEffect, useState } from "react";
import { ProviderId } from "@/lib/ai/types";
import { checkProviderHealth, configureOllama } from "@/lib/ai";
import { UserSettings, saveUserSettings } from "@/lib/storage/db";
import {
  X,
  Cpu,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Terminal,
  Sun,
  Shield,
  Volume2,
  MapPin,
  Lock,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsSaved: (updated: UserSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsSaved,
}: SettingsModalProps) {
  const [providerId, setProviderId] = useState<ProviderId>(settings.activeProviderId);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(settings.ollamaBaseUrl);
  const [ollamaModel, setOllamaModel] = useState(settings.ollamaModel);
  const [highContrastMode, setHighContrastMode] = useState(settings.highContrastMode);
  const [wakeLockEnabled, setWakeLockEnabled] = useState(settings.wakeLockEnabled);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [locationEnabled, setLocationEnabled] = useState(settings.locationEnabled);

  const [isCheckingOllama, setIsCheckingOllama] = useState(false);
  const [ollamaHealthStatus, setOllamaHealthStatus] = useState<{
    tested: boolean;
    isAvailable: boolean;
    message?: string;
    modelsFound?: string[];
  }>({ tested: false, isAvailable: false });

  useEffect(() => {
    setProviderId(settings.activeProviderId);
    setOllamaBaseUrl(settings.ollamaBaseUrl);
    setOllamaModel(settings.ollamaModel);
    setHighContrastMode(settings.highContrastMode);
    setWakeLockEnabled(settings.wakeLockEnabled);
    setSoundEnabled(settings.soundEnabled);
    setLocationEnabled(settings.locationEnabled);
  }, [settings]);

  if (!isOpen) return null;

  const testOllamaConnection = async () => {
    setIsCheckingOllama(true);
    configureOllama(ollamaBaseUrl, ollamaModel);
    try {
      const res = await checkProviderHealth("ollama");
      setOllamaHealthStatus({
        tested: true,
        isAvailable: res.isAvailable,
        message: res.message,
        modelsFound: res.modelsFound,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOllamaHealthStatus({
        tested: true,
        isAvailable: false,
        message: `Connection failed: ${msg}`,
      });
    } finally {
      setIsCheckingOllama(false);
    }
  };

  const handleSave = async () => {
    configureOllama(ollamaBaseUrl, ollamaModel);
    const updated = await saveUserSettings({
      activeProviderId: providerId,
      ollamaBaseUrl,
      ollamaModel,
      highContrastMode,
      wakeLockEnabled,
      soundEnabled,
      locationEnabled,
    });
    onSettingsSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto border border-emerald-500/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b3d2b] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Engine & Settings
              </h2>
              <p className="text-xs text-[#8ca094]">
                Configure open-weight AI, display & permissions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#12281c] text-[#8ca094] hover:text-white transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Provider Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Active AI Provider
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Demo Provider Card */}
            <button
              type="button"
              onClick={() => setProviderId("demo")}
              className={`p-4 rounded-2xl text-left transition-all border outline-none cursor-pointer
                ${
                  providerId === "demo"
                    ? "bg-[#112a1d] border-emerald-400 ring-2 ring-emerald-400/30 text-white"
                    : "bg-[#091710] hover:bg-[#0d2218] border-[#1b3a28] text-[#93a99c]"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                {providerId === "demo" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                    Active
                  </span>
                )}
              </div>
              <span className="font-bold text-sm text-white block">Demo Engine</span>
              <p className="text-xs text-[#8ca094] mt-1 leading-relaxed">
                Zero-setup offline generator. Perfect for judges without running local daemons.
              </p>
            </button>

            {/* Ollama Provider Card */}
            <button
              type="button"
              onClick={() => setProviderId("ollama")}
              className={`p-4 rounded-2xl text-left transition-all border outline-none cursor-pointer
                ${
                  providerId === "ollama"
                    ? "bg-[#112a1d] border-emerald-400 ring-2 ring-emerald-400/30 text-white"
                    : "bg-[#091710] hover:bg-[#0d2218] border-[#1b3a28] text-[#93a99c]"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <Server className="w-5 h-5 text-teal-400" />
                {providerId === "ollama" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                    Active
                  </span>
                )}
              </div>
              <span className="font-bold text-sm text-white block">Local AI · Ollama</span>
              <p className="text-xs text-[#8ca094] mt-1 leading-relaxed">
                Open-weight models (Gemma 2, Llama 3.2) running on your machine via Ollama.
              </p>
            </button>
          </div>
        </div>

        {/* Ollama Configuration */}
        {providerId === "ollama" && (
          <div className="p-4 rounded-2xl bg-[#091710] border border-[#1b3a28] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Ollama Local Server Configuration
              </span>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs text-[#9bb0a3] block mb-1">Endpoint URL</label>
                <input
                  type="text"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e2117] border border-[#21432f] text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#9bb0a3] block mb-1">Model Name</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="gemma2:2b"
                  className="w-full px-3 py-2 rounded-xl bg-[#0e2117] border border-[#21432f] text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
                <span className="text-[11px] text-[#789182] mt-1 block">
                  Recommended: <code className="text-emerald-400">gemma2:2b</code> or <code className="text-emerald-400">llama3.2:1b</code>
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={testOllamaConnection}
                  disabled={isCheckingOllama}
                  className="px-4 py-2 rounded-xl bg-[#142e20] hover:bg-[#1b3c2a] text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingOllama ? "animate-spin" : ""}`} />
                  <span>{isCheckingOllama ? "Testing..." : "Test Connection"}</span>
                </button>

                {ollamaHealthStatus.tested && (
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {ollamaHealthStatus.isAvailable ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Connected
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Unavailable
                      </span>
                    )}
                  </div>
                )}
              </div>

              {ollamaHealthStatus.tested && !ollamaHealthStatus.isAvailable && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed space-y-2">
                  <p>Ollama is not responding at {ollamaBaseUrl}.</p>
                  <p className="text-[11px] text-[#b6caba]">
                    Quick fix: Run <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">ollama run {ollamaModel || "gemma2:2b"}</code> in a terminal, or switch back to <strong>Demo Engine</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setProviderId("demo")}
                    className="text-xs font-bold text-emerald-400 underline block cursor-pointer"
                  >
                    Switch back to Demo Engine
                  </button>
                </div>
              )}

              {ollamaHealthStatus.tested && ollamaHealthStatus.isAvailable && ollamaHealthStatus.modelsFound && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                  <span className="font-bold block mb-1">Installed Models:</span>
                  <div className="flex flex-wrap gap-1">
                    {ollamaHealthStatus.modelsFound.length > 0 ? (
                      ollamaHealthStatus.modelsFound.map((m) => (
                        <span
                          key={m}
                          onClick={() => setOllamaModel(m)}
                          className="px-2 py-0.5 rounded-md bg-[#132c1e] text-[11px] font-mono text-emerald-300 cursor-pointer hover:bg-emerald-500/30"
                          title="Click to select model"
                        >
                          {m}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#8ca094]">None found yet. Run `ollama pull gemma2:2b`.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Outdoor & Hardware Preferences */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Outdoor Experience Controls
          </label>

          <div className="space-y-2.5">
            {/* High Contrast Mode */}
            <div className="p-3.5 rounded-2xl bg-[#091710] border border-[#1b3a28] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    High Contrast Outdoor Display
                  </span>
                  <span className="text-[11px] text-[#8ba294]">
                    Maximizes readability under direct sunlight
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={highContrastMode}
                onChange={(e) => setHighContrastMode(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Screen Wake Lock */}
            <div className="p-3.5 rounded-2xl bg-[#091710] border border-[#1b3a28] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    Keep Screen Awake on Active Timer
                  </span>
                  <span className="text-[11px] text-[#8ba294]">
                    Prevents display from sleeping during outdoor missions
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={wakeLockEnabled}
                onChange={(e) => setWakeLockEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Audio Voice Briefings */}
            <div className="p-3.5 rounded-2xl bg-[#091710] border border-[#1b3a28] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    Voice Mission Briefings
                  </span>
                  <span className="text-[11px] text-[#8ba294]">
                    Read missions aloud so you can pocket phone immediately
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Location Privacy */}
            <div className="p-3.5 rounded-2xl bg-[#091710] border border-[#1b3a28] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-sm font-bold text-white block">
                    Optional Coarse Location Context
                  </span>
                  <span className="text-[11px] text-[#8ba294]">
                    Stays on device &bull; Coarse coordinates are never uploaded to the cloud
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={locationEnabled}
                onChange={(e) => setLocationEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-[#06120b] border border-[#14291e] text-xs text-[#8da294] leading-relaxed flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Local-First Guarantee:</strong> VERDA stores all missions, photos, and reflections directly in your browser&apos;s IndexedDB. No user accounts, tracking cookies, or cloud telemetry.
          </span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1b3d2b]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8ca094] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#022c22] text-xs font-extrabold tracking-wide transition-all shadow-md cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
