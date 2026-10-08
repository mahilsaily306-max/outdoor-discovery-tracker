import {
  AIMissionRawOutputSchema,
  JournalReflection,
  JournalReflectionRawSchema,
  Mission,
  MissionRequest,
  MissionSchema,
  ReflectionRequest,
} from "../schemas/mission";
import { interceptMissionSafety, interceptReflectionSafety } from "../safety/interceptor";
import { getMission, saveMission } from "../storage/db";
import { DemoProvider } from "./demo-provider";
import { OllamaProvider } from "./ollama-provider";
import { AIProvider, ProviderHealth, ProviderId, ProviderInfo } from "./types";

const demoProvider = new DemoProvider();
const ollamaProvider = new OllamaProvider();

const providers: Record<ProviderId, AIProvider> = {
  demo: demoProvider,
  ollama: ollamaProvider,
  hosted: demoProvider,
};

export function getProvider(id: ProviderId): AIProvider {
  return providers[id] || demoProvider;
}

export function configureOllama(baseUrl?: string, model?: string) {
  if (baseUrl) ollamaProvider.setBaseUrl(baseUrl);
  if (model) ollamaProvider.setModel(model);
}

export async function checkProviderHealth(id: ProviderId): Promise<ProviderHealth> {
  const provider = getProvider(id);
  return await provider.checkHealth();
}

export interface GenerateMissionOptions {
  providerId?: ProviderId;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

export async function generateSafeMission(
  request: MissionRequest,
  options?: GenerateMissionOptions
): Promise<{ mission: Mission; providerInfo: ProviderInfo }> {
  const targetProviderId = options?.providerId || "demo";
  const provider = getProvider(targetProviderId);

  if (targetProviderId === "ollama") {
    configureOllama(options?.ollamaBaseUrl, options?.ollamaModel);
  }

  // 1. Generate via selected provider
  const rawOutput = await provider.generateMission(request);

  // 2. Validate raw schema
  const parsed = AIMissionRawOutputSchema.parse(rawOutput);

  // 3. Pass through deterministic safety interceptor
  const safetyCheck = interceptMissionSafety(parsed);
  if (!safetyCheck.isSafe) {
    throw new Error(
      `Safety violation detected in generated mission: ${safetyCheck.reasons.join(", ")}. Please try again.`
    );
  }

  const safeData = safetyCheck.sanitizedOutput || parsed;

  // 4. Construct complete Mission record
  const missionId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `mission_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const mission: Mission = {
    id: missionId,
    activity: request.activity,
    duration: request.duration,
    difficulty: request.difficulty,
    title: safeData.title,
    description: safeData.description,
    objectives: safeData.objectives.map((obj, idx) => ({
      id: `obj_${idx + 1}_${Date.now()}`,
      title: obj.title,
      description: obj.description,
      completed: false,
    })),
    safetyChecklist: safeData.safetyChecklist,
    screenAwayPrompt: safeData.screenAwayPrompt,
    estimatedOutdoorMinutes: safeData.estimatedOutdoorMinutes || request.duration,
    provider: targetProviderId,
    modelName: provider.info.model,
    createdAt: new Date().toISOString(),
    status: "created",
    discoveries: [],
  };

  // 5. Validate full schema
  const validatedMission = MissionSchema.parse(mission);

  // 6. Save to local-first IndexedDB
  await saveMission(validatedMission);

  return {
    mission: validatedMission,
    providerInfo: provider.info,
  };
}

export async function generateSafeReflection(
  request: ReflectionRequest,
  options?: GenerateMissionOptions
): Promise<{ reflection: JournalReflection; providerInfo: ProviderInfo }> {
  const targetProviderId = options?.providerId || "demo";
  const provider = getProvider(targetProviderId);

  if (targetProviderId === "ollama") {
    configureOllama(options?.ollamaBaseUrl, options?.ollamaModel);
  }

  const rawReflection = await provider.generateReflection(request);
  const parsed = JournalReflectionRawSchema.parse(rawReflection);

  // Safety filter for AI reflections
  const safetyCheck = interceptReflectionSafety(parsed);
  const safeReflectionData = safetyCheck.sanitizedOutput || parsed;

  const reflectionId = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `refl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const reflection: JournalReflection = {
    ...safeReflectionData,
    id: reflectionId,
    missionId: request.missionId,
    createdAt: new Date().toISOString(),
  };

  // Update mission in IndexedDB with the reflection
  const existingMission = await getMission(request.missionId);
  if (existingMission) {
    const updatedMission: Mission = {
      ...existingMission,
      reflection,
      status: "completed",
      actualOutdoorMinutes: request.actualDuration,
      completedAt: new Date().toISOString(),
    };
    await saveMission(updatedMission);
  }

  return {
    reflection,
    providerInfo: provider.info,
  };
}
