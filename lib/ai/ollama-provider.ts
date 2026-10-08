import {
  AIMissionRawOutput,
  AIMissionRawOutputSchema,
  JournalReflectionRaw,
  JournalReflectionRawSchema,
  MissionRequest,
  ReflectionRequest,
} from "../schemas/mission";
import { AIProvider, ProviderHealth, ProviderInfo } from "./types";

export class OllamaProvider implements AIProvider {
  readonly id = "ollama" as const;
  private baseUrl: string;
  private model: string;

  constructor(baseUrl?: string, model?: string) {
    this.baseUrl = baseUrl || "http://127.0.0.1:11434";
    this.model = model || "gemma2:2b";
  }

  get info(): ProviderInfo {
    return {
      id: "ollama",
      name: "Ollama (Open-Weight Local AI)",
      description: `Locally executed open-weight models (e.g. Gemma 2, Llama 3.2) running on your device via Ollama.`,
      isOpenSource: true,
      requiresLocalServer: true,
      model: this.model,
      endpoint: this.baseUrl,
    };
  }

  setModel(model: string) {
    this.model = model;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async checkHealth(): Promise<ProviderHealth> {
    try {
      const res = await fetch(`/api/ollama?baseUrl=${encodeURIComponent(this.baseUrl)}`, {
        method: "GET",
      });

      if (!res.ok) {
        return {
          isAvailable: false,
          checkedAt: new Date().toISOString(),
          message: `Server returned HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      return {
        isAvailable: Boolean(data.isAvailable),
        checkedAt: new Date().toISOString(),
        message: data.message,
        modelsFound: data.modelsFound,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        isAvailable: false,
        checkedAt: new Date().toISOString(),
        message: `Network error connecting to local Ollama service: ${msg}`,
      };
    }
  }

  async generateMission(request: MissionRequest): Promise<AIMissionRawOutput> {
    const res = await fetch("/api/ollama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate",
        request,
        model: this.model,
        baseUrl: this.baseUrl,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error occurred" }));
      const msg = errorData.error || `Ollama API returned HTTP ${res.status}`;
      const hint = errorData.hint ? ` (${errorData.hint})` : "";
      throw new Error(`${msg}${hint}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || "Failed to receive valid mission data from Ollama");
    }

    return AIMissionRawOutputSchema.parse(json.data);
  }

  async generateReflection(request: ReflectionRequest): Promise<JournalReflectionRaw> {
    const res = await fetch("/api/ollama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reflect",
        request,
        model: this.model,
        baseUrl: this.baseUrl,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error occurred" }));
      const msg = errorData.error || `Ollama API returned HTTP ${res.status}`;
      const hint = errorData.hint ? ` (${errorData.hint})` : "";
      throw new Error(`${msg}${hint}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || "Failed to receive valid reflection data from Ollama");
    }

    return JournalReflectionRawSchema.parse(json.data);
  }
}
