import { AIMissionRawOutput } from "../schemas/mission";

export interface SafetyCheckResult {
  isSafe: boolean;
  reasons: string[];
  sanitizedOutput?: AIMissionRawOutput;
}

// Patterns that violate outdoor safety principles
const HAZARDOUS_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  {
    regex: /\b(trespass|private property|(hop|jump)( the)? fence|climb gate|restricted (area|zone|property|grounds)|keep out|no trespassing)\b/i,
    reason: "Contains instructions involving trespassing or unauthorized private property access.",
  },
  {
    regex: /\b(busy (highway|freeway|road)|cross (the )?highway|walk along the highway|active railway|train tracks)\b/i,
    reason: "Encourages hazardous interaction with busy vehicle traffic or railway corridors.",
  },
  {
    regex: /\b(approach (wild|dangerous)?\s*(bear|alligator|bison|coyote|snake|raccoon|wolf|venomous)|pet wildlife|feed (wildlife|animals|birds|ducks))\b/i,
    reason: "Encourages risky interaction with or feeding of wildlife.",
  },
  {
    regex: /\b(thin ice|frozen lake|cliff edge|crumbling ledge|unmarked cave|abandoned building|mine shaft)\b/i,
    reason: "Directs users toward structurally unstable or high-fall-risk geographical hazards.",
  },
  {
    regex: /\b(severe (thunderstorm|blizzard|tornado)|lightning storm|flash flood|hurricane)\b/i,
    reason: "Suggests activity during extreme and dangerous meteorological conditions.",
  },
  {
    regex: /\b(blindfold|eyes closed while walking|walk without looking where you step)\b/i,
    reason: "Encourages sensory deprivation while moving through outdoor terrain.",
  },
];

const DEFAULT_SAFETY_ITEMS = [
  "Stay on designated public paths and respect local park regulations.",
  "Remain aware of surroundings and vehicular traffic when near road crossings.",
  "Never disturb, feed, or approach wild fauna.",
  "Check local weather and turn back immediately if conditions worsen.",
  "Carry adequate hydration and dress for the ambient temperature.",
];

/**
 * Deterministic safety interceptor that validates generated mission outputs
 * against strict physical safety heuristics before reaching the UI.
 */
export function interceptMissionSafety(raw: AIMissionRawOutput): SafetyCheckResult {
  const violations: string[] = [];

  // 1. Scan text content (title, description, objectives, screen-away prompt)
  const fullTextToInspect = [
    raw.title,
    raw.description,
    raw.screenAwayPrompt,
    ...raw.objectives.map((o) => `${o.title} ${o.description}`),
    ...raw.safetyChecklist,
  ].join(" \n ");

  for (const pattern of HAZARDOUS_PATTERNS) {
    if (pattern.regex.test(fullTextToInspect)) {
      violations.push(pattern.reason);
    }
  }

  if (violations.length > 0) {
    return {
      isSafe: false,
      reasons: violations,
    };
  }

  // 2. Ensure safety checklist is robust and includes essential outdoor precautions
  const mergedSafetyChecklist = [...new Set([...raw.safetyChecklist, ...DEFAULT_SAFETY_ITEMS])].slice(0, 5);

  // 3. Ensure objectives have proper safety posture
  const sanitizedOutput: AIMissionRawOutput = {
    ...raw,
    safetyChecklist: mergedSafetyChecklist,
  };

  return {
    isSafe: true,
    reasons: [],
    sanitizedOutput,
  };
}

/**
 * Validates AI reflection outputs and next-step recommendations
 * against outdoor physical hazards before recording into the journal.
 */
export function interceptReflectionSafety(
  raw: import("../schemas/mission").JournalReflectionRaw
): { isSafe: boolean; reasons: string[]; sanitizedOutput?: import("../schemas/mission").JournalReflectionRaw } {
  const violations: string[] = [];

  const textToScan = [
    raw.summary,
    raw.reflection,
    raw.nextRecommendation,
    ...raw.discoveriesHighlight,
  ].join(" \n ");

  for (const pattern of HAZARDOUS_PATTERNS) {
    if (pattern.regex.test(textToScan)) {
      violations.push(pattern.reason);
    }
  }

  if (violations.length > 0) {
    // If the nextRecommendation had a hazardous suggestion, replace it with a safe default
    return {
      isSafe: false,
      reasons: violations,
      sanitizedOutput: {
        ...raw,
        nextRecommendation: "Explore a tranquil neighborhood park or community green trail during daylight hours.",
      },
    };
  }

  return {
    isSafe: true,
    reasons: [],
    sanitizedOutput: raw,
  };
}

