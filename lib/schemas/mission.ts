import { z } from "zod";

export const ActivityTypeSchema = z.enum([
  "walk",
  "run",
  "explore",
  "birding",
  "gardening",
  "nature-discovery",
]);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const DifficultyLevelSchema = z.enum(["easy", "moderate", "challenging"]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const MissionStateSchema = z.enum([
  "created",
  "ready",
  "active",
  "paused",
  "completed",
  "abandoned",
]);
export type MissionState = z.infer<typeof MissionStateSchema>;

export const MissionObjectiveSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  description: z.string().min(5),
  completed: z.boolean().default(false),
});

export type MissionObjective = z.infer<typeof MissionObjectiveSchema>;

export const DiscoveryTagSchema = z.enum([
  "plant",
  "tree",
  "bird",
  "landscape",
  "water",
  "sky",
  "micro-fauna",
  "texture",
  "other",
]);
export type DiscoveryTag = z.infer<typeof DiscoveryTagSchema>;

export const DiscoverySchema = z.object({
  id: z.string(),
  missionId: z.string(),
  timestamp: z.string().datetime(),
  type: z.enum(["note", "photo", "voice"]),
  note: z.string().min(1),
  photoDataUrl: z.string().optional(),
  tag: DiscoveryTagSchema.default("other"),
  locationLabel: z.string().optional(),
});
export type Discovery = z.infer<typeof DiscoverySchema>;

export const JournalReflectionRawSchema = z.object({
  summary: z.string().min(10),
  discoveriesHighlight: z.array(z.string().min(3)).min(1),
  reflection: z.string().min(15),
  mood: z.enum(["grounded", "energized", "calm", "curious", "refreshed"]),
  nextRecommendation: z.string().min(10),
});
export type JournalReflectionRaw = z.infer<typeof JournalReflectionRawSchema>;

export const JournalReflectionSchema = JournalReflectionRawSchema.extend({
  id: z.string(),
  missionId: z.string(),
  createdAt: z.string().datetime(),
});
export type JournalReflection = z.infer<typeof JournalReflectionSchema>;

export const MissionSchema = z.object({
  id: z.string(),
  activity: ActivityTypeSchema,
  duration: z.number().int().positive(),
  difficulty: DifficultyLevelSchema,
  title: z.string().min(5),
  description: z.string().min(10),
  objectives: z.array(MissionObjectiveSchema).min(2).max(6),
  safetyChecklist: z.array(z.string().min(5)).min(2),
  screenAwayPrompt: z.string().min(10),
  estimatedOutdoorMinutes: z.number().int().positive(),
  provider: z.enum(["demo", "ollama", "hosted"]),
  modelName: z.string().min(1),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  actualOutdoorMinutes: z.number().int().nonnegative().optional(),
  status: MissionStateSchema.default("created"),
  discoveries: z.array(DiscoverySchema).default([]),
  reflection: JournalReflectionSchema.optional(),
});

export type Mission = z.infer<typeof MissionSchema>;

/**
 * Raw output schema expected from AI providers before runtime metadata is attached
 */
export const AIMissionRawOutputSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  objectives: z.array(
    z.object({
      title: z.string().min(3),
      description: z.string().min(5),
    })
  ).min(2).max(6),
  safetyChecklist: z.array(z.string().min(5)).min(2),
  screenAwayPrompt: z.string().min(10),
  estimatedOutdoorMinutes: z.number().int().positive().optional(),
});

export type AIMissionRawOutput = z.infer<typeof AIMissionRawOutputSchema>;

export const MissionRequestSchema = z.object({
  activity: ActivityTypeSchema,
  duration: z.number().int().positive(),
  difficulty: DifficultyLevelSchema,
  preferences: z.string().optional(),
  environmentHint: z.string().optional(),
});

export type MissionRequest = z.infer<typeof MissionRequestSchema>;

export const ReflectionRequestSchema = z.object({
  missionId: z.string(),
  activity: ActivityTypeSchema,
  plannedDuration: z.number().int().positive(),
  actualDuration: z.number().int().nonnegative(),
  objectives: z.array(
    z.object({
      title: z.string(),
      completed: z.boolean(),
    })
  ),
  discoveries: z.array(
    z.object({
      type: z.enum(["note", "photo", "voice"]),
      note: z.string(),
      tag: z.string().optional(),
    })
  ),
  generalContext: z.string().optional(),
});
export type ReflectionRequest = z.infer<typeof ReflectionRequestSchema>;
