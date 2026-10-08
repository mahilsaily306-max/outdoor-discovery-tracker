"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Discovery, DiscoveryTag } from "@/lib/schemas/mission";
import { compressImageFile } from "@/lib/utils/image-compressor";
import { isSpeechRecognitionSupported, startSpeechRecognition } from "@/lib/utils/speech";
import {
  X,
  Camera,
  Mic,
  MicOff,
  MapPin,
  Sparkles,
  Tag,
  Loader2,
  Check,
  Leaf,
} from "lucide-react";

interface DiscoveryRecorderModalProps {
  isOpen: boolean;
  missionId: string;
  onClose: () => void;
  onSave: (discovery: Discovery) => void;
}

const TAG_OPTIONS: Array<{ tag: DiscoveryTag; label: string; icon: string }> = [
  { tag: "tree", label: "Tree", icon: "🌳" },
  { tag: "plant", label: "Plant / Flower", icon: "🌿" },
  { tag: "bird", label: "Bird / Feather", icon: "🐦" },
  { tag: "texture", label: "Bark / Texture", icon: "🪵" },
  { tag: "landscape", label: "Horizon / Trail", icon: "🏞️" },
  { tag: "micro-fauna", label: "Insect / Bee", icon: "🐝" },
  { tag: "water", label: "Pond / Stream", icon: "💧" },
  { tag: "other", label: "Other", icon: "✨" },
];

export function DiscoveryRecorderModal({
  isOpen,
  missionId,
  onClose,
  onSave,
}: DiscoveryRecorderModalProps) {
  const [note, setNote] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [tag, setTag] = useState<DiscoveryTag>("other");
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stopVoiceRef = useRef<(() => void) | null>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    try {
      const compressed = await compressImageFile(file);
      setPhotoDataUrl(compressed);
      if (!note) {
        setNote("Captured a natural feature during exploration");
      }
    } catch (err) {
      console.error("Photo compression failed:", err);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      if (stopVoiceRef.current) stopVoiceRef.current();
      setIsRecordingVoice(false);
    } else {
      if (!isSpeechRecognitionSupported()) {
        alert("Speech recognition is not supported in this browser. You can type observations directly.");
        return;
      }

      setIsRecordingVoice(true);
      const abortFn = startSpeechRecognition(
        (transcript) => {
          setNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        () => setIsRecordingVoice(false),
        (err) => {
          console.warn("Speech recognition error:", err);
          setIsRecordingVoice(false);
        }
      );
      stopVoiceRef.current = abortFn;
    }
  };

  const handleRequestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("Detecting location context...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Round coordinates to ~1km for privacy
        const lat = pos.coords.latitude.toFixed(2);
        const lon = pos.coords.longitude.toFixed(2);
        const label = `Outdoor trail area (approx. ${lat}°N, ${lon}°E)`;
        setLocationLabel(label);
        setLocationStatus("Coarse location context recorded (stays on device)");
      },
      (err) => {
        setLocationStatus(`Location permission denied or unavailable (${err.message}).`);
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  const handleSaveDiscovery = () => {
    if (!note.trim() && !photoDataUrl) return;

    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `disc_${Date.now()}`;

    const discovery: Discovery = {
      id,
      missionId,
      timestamp: new Date().toISOString(),
      type: photoDataUrl ? "photo" : isRecordingVoice ? "voice" : "note",
      note: note.trim() || "Natural observation recorded in field",
      photoDataUrl: photoDataUrl || undefined,
      tag,
      locationLabel: locationLabel || undefined,
    };

    onSave(discovery);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-5 sm:p-6 space-y-5 border border-emerald-500/40 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b3d2b] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Record Field Discovery
              </h2>
              <p className="text-xs text-[#8ca094]">
                Capture what you noticed outside
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#12281c] text-[#8ca094] hover:text-white transition-colors cursor-pointer"
            aria-label="Close discovery modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Observation Note / Voice Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#a1b8ab]">
              Observation Details
            </label>
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isRecordingVoice
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-[#142e20] text-emerald-300 hover:bg-[#1c3e2c]"
              }`}
            >
              {isRecordingVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecordingVoice ? "Listening..." : "Speak observation"}</span>
            </button>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Found a large oak tree near the bend with thick moss growing on its north side..."
            className="w-full px-4 py-3 rounded-2xl bg-[#091710] border border-[#1b3a28] focus:border-emerald-500/80 text-sm text-white placeholder-[#587062] outline-none transition-colors"
          />
        </div>

        {/* Photo Capture */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#a1b8ab] block">
            Discovery Photograph
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {photoDataUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black/40">
              <Image
                src={photoDataUrl}
                alt="Captured discovery"
                width={600}
                height={176}
                unoptimized
                className="w-full h-44 object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotoDataUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 text-[11px] text-emerald-300">
                Stored locally on device
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isProcessingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-[#1f4530] hover:border-emerald-500/60 bg-[#091710]/70 hover:bg-[#0e2418] flex items-center justify-center gap-2.5 text-xs font-bold text-[#8ca495] hover:text-white transition-all cursor-pointer"
            >
              {isProcessingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Optimizing photo locally...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Snap Photo with Camera / Select Image</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tag Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#a1b8ab] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Category</span>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((t) => {
              const isSelected = tag === t.tag;
              return (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => setTag(t.tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all outline-none cursor-pointer
                    ${
                      isSelected
                        ? "bg-emerald-500 text-[#022c22] font-bold shadow-md shadow-emerald-950/60"
                        : "bg-[#0b1c13] hover:bg-[#12281c] border border-[#1b3a28] text-[#93a89c] hover:text-white"
                    }
                  `}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Location Context */}
        <div className="p-3 rounded-2xl bg-[#07150e] border border-[#142b1e] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8ea596] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optional Coarse Location Context</span>
            </span>

            {!locationLabel && (
              <button
                type="button"
                onClick={handleRequestLocation}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Add general area
              </button>
            )}
          </div>

          {locationStatus && (
            <p className="text-[11px] text-[#7d9687] leading-relaxed">
              {locationStatus}
            </p>
          )}
          {locationLabel && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{locationLabel}</span>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
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
            disabled={!note.trim() && !photoDataUrl}
            onClick={handleSaveDiscovery}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all shadow-md cursor-pointer
              ${
                !note.trim() && !photoDataUrl
                  ? "bg-[#14281d] text-[#556b5d] cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-[#022c22] shadow-emerald-950/60 hover:scale-[1.02]"
              }
            `}
          >
            Save Discovery
          </button>
        </div>
      </div>
    </div>
  );
}
