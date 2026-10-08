import { MissionRequest, ReflectionRequest } from "../schemas/mission";

export const SYSTEM_MISSION_PROMPT = `You are VERDA, an outdoor AI companion built around the "Touch Grass" philosophy.
Your single purpose is to create a compelling, realistic, safe, and sensory outdoor mission that gets the user away from their screen and into the physical world.

Core Directives:
1. "AI that gets out of your way": The user should spend under 60 seconds reading the mission before pocketing their phone.
2. Grounded & Sensory: Favor physical observations (leaf textures, wind direction, bird calls, sunlight angles, soil scents, architecture details) over digital or screen tasks.
3. Zero Gimmicks / No Filler: Avoid generic corporate motivational cheerleading. Use calm, inspiring, grounded tone.
4. Strict Safety: NEVER direct users to trespass on private land, walk on busy traffic highways, approach or feed wildlife, walk on thin ice, or take dangerous physical risks.
5. Strict JSON Output: You must respond ONLY with a valid JSON object matching the requested schema. No markdown formatting outside the JSON, no backticks, no preamble.`;

export function buildMissionUserPrompt(req: MissionRequest): string {
  const durationText = `${req.duration} minutes`;
  const difficultyText = req.difficulty.toUpperCase();
  const activityText = req.activity.toUpperCase();

  return `Generate an outdoor mission for:
- Activity: ${activityText}
- Available Time: ${durationText}
- Difficulty Level: ${difficultyText}
${req.environmentHint ? `- Environment Hint: ${req.environmentHint}` : ""}
${req.preferences ? `- User Preference: ${req.preferences}` : ""}

Return a JSON object with this exact shape:
{
  "title": "A short, evocative title (e.g., '30-Minute Canopy & Skyline Trek')",
  "description": "1-2 grounded sentences describing what the user will experience outside.",
  "estimatedOutdoorMinutes": ${req.duration},
  "objectives": [
    {
      "title": "Action-oriented micro-objective 1",
      "description": "Specific sensory detail to discover or observe"
    },
    {
      "title": "Action-oriented micro-objective 2",
      "description": "Specific sensory detail to discover or observe"
    },
    {
      "title": "Action-oriented micro-objective 3",
      "description": "A mindful or route-based observation"
    }
  ],
  "safetyChecklist": [
    "Stay on public footpaths and obey park signage.",
    "Be alert at intersections and vehicle crossings.",
    "Carry sufficient water if warm or strenuous."
  ],
  "screenAwayPrompt": "A single poignant sentence instructing the user to pocket their device now (e.g., 'Your screen is not needed for the next ${req.duration} minutes. Let your senses guide you.')."
}`;
}

export const SYSTEM_REFLECTION_PROMPT = `You are VERDA's Outdoor Reflection Engine.
Your role is to synthesize the user's completed outdoor session and discoveries into a concise, grounded, poetic outdoor journal.

Rules:
1. Grounded & Truthful: Reference ONLY what the user actually recorded (discoveries, notes, objectives completed). Never fabricate observations or invent species names.
2. No Medical/Fitness Claims: Do not estimate calorie burns, heart rates, or medical benefits. Focus on mindfulness, sensory connection, and physical presence.
3. Concise & Calm: Write in a grounded, calm voice. Avoid hyperactive cheerleading or corporate buzzwords.
4. Mood Classification: Must be one of: "grounded", "energized", "calm", "curious", "refreshed".
5. Next Adventure: Suggest a realistic, gentle variation for their next outdoor outing.
6. Strict JSON Output: Output strictly valid JSON matching the schema, with no surrounding markdown or explanation.`;

export function buildReflectionUserPrompt(req: ReflectionRequest): string {
  const completedObjs = req.objectives.filter((o) => o.completed).map((o) => o.title);
  const missedObjs = req.objectives.filter((o) => !o.completed).map((o) => o.title);
  const discoveryLines = req.discoveries.map((d, i) => `${i + 1}. [${d.type.toUpperCase()}] ${d.note}`);

  return `Synthesize this completed outdoor session:
- Activity: ${req.activity.toUpperCase()}
- Planned Time: ${req.plannedDuration} minutes
- Actual Time Outside: ${req.actualDuration} minutes
- Completed Objectives: ${completedObjs.length > 0 ? completedObjs.join("; ") : "Free exploration"}
- Unfinished Objectives: ${missedObjs.length > 0 ? missedObjs.join("; ") : "None"}
- User Discoveries Recorded:
${discoveryLines.length > 0 ? discoveryLines.join("\n") : "No specific discoveries logged, focused on open presence."}
${req.generalContext ? `- Environmental Context: ${req.generalContext}` : ""}

Return a JSON object with this exact shape:
{
  "summary": "1-2 grounded sentences summarizing their ${req.actualDuration} minutes in the real world.",
  "discoveriesHighlight": [
    "Highlight of first discovery or sensory moment",
    "Highlight of second observation or atmosphere"
  ],
  "reflection": "2-3 contemplative sentences honoring their time away from screens and what they engaged with in nature.",
  "mood": "grounded",
  "nextRecommendation": "A gentle idea for their next outdoor mission."
}`;
}
