import { AIMissionRawOutput, JournalReflectionRaw, MissionRequest, ReflectionRequest } from "../schemas/mission";

export type ProviderId = "demo" | "ollama" | "hosted";

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  description: string;
  isOpenSource: boolean;
  requiresLocalServer: boolean;
  model: string;
  endpoint?: string;
}

export interface ProviderHealth {
  isAvailable: boolean;
  checkedAt: string;
  message?: string;
  modelsFound?: string[];
}

export interface AIProvider {
  readonly id: ProviderId;
  readonly info: ProviderInfo;
  checkHealth(): Promise<ProviderHealth>;
  generateMission(request: MissionRequest): Promise<AIMissionRawOutput>;
  generateReflection(request: ReflectionRequest): Promise<JournalReflectionRaw>;
}
