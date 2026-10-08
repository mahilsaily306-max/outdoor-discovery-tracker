import { get, set, del, values } from "idb-keyval";
import { Discovery, Mission } from "../schemas/mission";
import { ProviderId } from "../ai/types";

const MISSIONS_PREFIX = "verda_mission_";
const SETTINGS_KEY = "verda_settings_v1";
const ACTIVE_MISSION_KEY = "verda_active_mission_id";

export interface UserSettings {
  activeProviderId: ProviderId;
  ollamaBaseUrl: string;
  ollamaModel: string;
  soundEnabled: boolean;
  highContrastMode: boolean;
  wakeLockEnabled: boolean;
  locationEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  activeProviderId: "demo",
  ollamaBaseUrl: "http://127.0.0.1:11434",
  ollamaModel: "gemma2:2b",
  soundEnabled: true,
  highContrastMode: false,
  wakeLockEnabled: true,
  locationEnabled: false,
};

export async function saveMission(mission: Mission): Promise<void> {
  if (typeof window === "undefined") return;
  await set(`${MISSIONS_PREFIX}${mission.id}`, mission);
}

export async function getMission(id: string): Promise<Mission | undefined> {
  if (typeof window === "undefined") return undefined;
  return await get<Mission>(`${MISSIONS_PREFIX}${id}`);
}

export async function getAllMissions(): Promise<Mission[]> {
  if (typeof window === "undefined") return [];
  try {
    const all = await values<Mission>();
    return all
      .filter((m): m is Mission => Boolean(m && m.id && m.activity && m.title))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Failed to load missions from IndexedDB:", err);
    return [];
  }
}

export async function updateMissionStatus(
  id: string,
  status: Mission["status"],
  updates?: Partial<Mission>
): Promise<void> {
  if (typeof window === "undefined") return;
  const existing = await get<Mission>(`${MISSIONS_PREFIX}${id}`);
  if (existing) {
    await set(`${MISSIONS_PREFIX}${id}`, {
      ...existing,
      status,
      ...updates,
    });
  }
}

export async function addDiscoveryToMission(missionId: string, discovery: Discovery): Promise<void> {
  if (typeof window === "undefined") return;
  const existing = await get<Mission>(`${MISSIONS_PREFIX}${missionId}`);
  if (existing) {
    const existingDiscoveries = existing.discoveries || [];
    await set(`${MISSIONS_PREFIX}${missionId}`, {
      ...existing,
      discoveries: [...existingDiscoveries, discovery],
    });
  }
}

export async function deleteMission(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  await del(`${MISSIONS_PREFIX}${id}`);
  const activeId = await getActiveMissionId();
  if (activeId === id) {
    await saveActiveMissionId(null);
  }
}

export async function saveActiveMissionId(id: string | null): Promise<void> {
  if (typeof window === "undefined") return;
  if (!id) {
    await del(ACTIVE_MISSION_KEY);
  } else {
    await set(ACTIVE_MISSION_KEY, id);
  }
}

export async function getActiveMissionId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return (await get<string>(ACTIVE_MISSION_KEY)) || null;
}

export async function getUserSettings(): Promise<UserSettings> {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = await get<UserSettings>(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch (err) {
    console.warn("Could not read settings from IndexedDB, falling back to defaults", err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const current = await getUserSettings();
    const updated = { ...current, ...settings };
    await set(SETTINGS_KEY, updated);
    return updated;
  } catch (err) {
    console.error("Failed to save settings to IndexedDB:", err);
    return DEFAULT_SETTINGS;
  }
}

export interface OutdoorStats {
  totalCompletedSessions: number;
  totalOutdoorMinutes: number;
  totalDiscoveries: number;
  currentStreakDays: number;
  favoriteActivity: string;
}

/**
 * Calculates genuine outdoor streaks and metrics based solely on completed missions.
 */
export function calculateOutdoorStats(missions: Mission[]): OutdoorStats {
  const completed = missions.filter((m) => m.status === "completed");

  const totalCompletedSessions = completed.length;
  const totalOutdoorMinutes = completed.reduce(
    (acc, m) => acc + (m.actualOutdoorMinutes || m.duration || 0),
    0
  );
  const totalDiscoveries = completed.reduce((acc, m) => acc + (m.discoveries?.length || 0), 0);

  // Favorite Activity
  const activityCounts: Record<string, number> = {};
  for (const m of completed) {
    activityCounts[m.activity] = (activityCounts[m.activity] || 0) + 1;
  }
  let favoriteActivity = "None";
  let maxCount = 0;
  for (const [act, count] of Object.entries(activityCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteActivity = act.replace("-", " ");
    }
  }

  // Calculate Streak in Days (consecutive unique calendar days ending today or yesterday)
  const uniqueDates = Array.from(
    new Set(
      completed
        .map((m) => {
          const d = m.completedAt ? new Date(m.completedAt) : new Date(m.createdAt);
          return d.toISOString().split("T")[0]; // YYYY-MM-DD
        })
        .sort()
        .reverse()
    )
  );

  let currentStreak = 0;
  if (uniqueDates.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const mostRecent = uniqueDates[0];
    if (mostRecent === today || mostRecent === yesterday) {
      currentStreak = 1;
      let checkDate = new Date(mostRecent);

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevExpected = new Date(checkDate.getTime() - 86400000)
          .toISOString()
          .split("T")[0];
        if (uniqueDates[i] === prevExpected) {
          currentStreak++;
          checkDate = new Date(prevExpected);
        } else {
          break;
        }
      }
    }
  }

  return {
    totalCompletedSessions,
    totalOutdoorMinutes,
    totalDiscoveries,
    currentStreakDays: currentStreak,
    favoriteActivity,
  };
}
