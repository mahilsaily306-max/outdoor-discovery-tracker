import { interceptMissionSafety } from "../lib/safety/interceptor.ts";
import { DemoProvider } from "../lib/ai/demo-provider.ts";
import {
  AIMissionRawOutputSchema,
  JournalReflectionRawSchema,
  DiscoverySchema,
} from "../lib/schemas/mission.ts";
import { calculateOutdoorStats } from "../lib/storage/db.ts";

async function runTests() {
  console.log("=== VERDA STAGE 2 VERIFICATION TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  const provider = new DemoProvider();

  // Test Suite 1: Demo Provider All Activities
  console.log("\n[Test Suite 1: Demo Provider Mission Generation]");
  const activities = ["walk", "run", "explore", "birding", "gardening", "nature-discovery"];

  for (const act of activities) {
    const raw = await provider.generateMission({
      activity: act,
      duration: 30,
      difficulty: "easy",
    });

    const parsed = AIMissionRawOutputSchema.safeParse(raw);
    assert(parsed.success, `Activity '${act}' produces valid AIMissionRawOutput`);
    assert(raw.objectives.length >= 2, `Activity '${act}' has at least 2 objectives`);
    assert(raw.safetyChecklist.length >= 2, `Activity '${act}' has safety checklist`);
    assert(raw.screenAwayPrompt.length > 10, `Activity '${act}' has screenAwayPrompt`);
  }

  // Test Suite 2: AI Reflection Generation with User Discoveries
  console.log("\n[Test Suite 2: AI Reflection Generation]");
  const reflectionReq = {
    missionId: "test_mission_123",
    activity: "walk",
    plannedDuration: 30,
    actualDuration: 28,
    objectives: [
      { title: "Find three leaf shapes", completed: true },
      { title: "Listen for two bird sounds", completed: true },
      { title: "Notice an ancient tree", completed: false },
    ],
    discoveries: [
      {
        type: "note",
        note: "Saw a large mossy boulder near the creek",
        tag: "texture",
      },
      {
        type: "photo",
        note: "Took photo of patterned oak bark",
        tag: "tree",
      },
    ],
  };

  const reflectionRaw = await provider.generateReflection(reflectionReq);
  const parsedReflection = JournalReflectionRawSchema.safeParse(reflectionRaw);
  assert(parsedReflection.success, "Reflection matches JournalReflectionRawSchema");
  assert(reflectionRaw.discoveriesHighlight.length >= 1, "Reflection includes discovery highlights");
  assert(
    reflectionRaw.reflection.includes("mossy boulder") ||
      reflectionRaw.discoveriesHighlight.some((h) => h.includes("mossy boulder")),
    "Reflection references actual user discovery"
  );
  assert(
    ["grounded", "energized", "calm", "curious", "refreshed"].includes(reflectionRaw.mood),
    `Valid mood assigned: ${reflectionRaw.mood}`
  );
  assert(reflectionRaw.nextRecommendation.length > 10, "Provides realistic next outdoor recommendation");

  // Test Suite 3: Discovery Schema
  console.log("\n[Test Suite 3: Discovery Model Validation]");
  const validDiscovery = {
    id: "disc_1",
    missionId: "test_mission_123",
    timestamp: new Date().toISOString(),
    type: "note",
    note: "Heard woodpecker in pine canopy",
    tag: "bird",
  };
  const parsedDisc = DiscoverySchema.safeParse(validDiscovery);
  assert(parsedDisc.success, "Valid discovery passes schema");

  // Test Suite 4: Safety Interceptor
  console.log("\n[Test Suite 4: Safety Interceptor Verification]");
  const safeMission = {
    title: "Canopy & River Walk",
    description: "Enjoy a mindful walk along public park paths.",
    objectives: [
      { title: "Notice leaf colors", description: "Observe shades of green" },
      { title: "Listen to breeze", description: "Pause and listen" },
    ],
    safetyChecklist: ["Stay on path", "Drink water"],
    screenAwayPrompt: "Pocket your phone and walk with presence.",
    estimatedOutdoorMinutes: 30,
  };
  const safeCheck = interceptMissionSafety(safeMission);
  assert(safeCheck.isSafe, "Safe mission passes safety interceptor");

  const hazardousMission = {
    ...safeMission,
    title: "Climb private property security gate",
  };
  const hazardCheck = interceptMissionSafety(hazardousMission);
  assert(!hazardCheck.isSafe, "Blocked trespassing instruction in mission");

  // Test reflection safety
  const { interceptReflectionSafety } = await import("../lib/safety/interceptor.ts");
  const safeReflection = {
    summary: "A peaceful outdoor stroll.",
    discoveriesHighlight: ["Noticed pine scent"],
    reflection: "Felt present in the surroundings.",
    mood: "calm",
    nextRecommendation: "Visit a community greenway tomorrow.",
  };
  const refSafeCheck = interceptReflectionSafety(safeReflection);
  assert(refSafeCheck.isSafe, "Safe reflection passes safety interceptor");

  const hazardousReflection = {
    ...safeReflection,
    nextRecommendation: "Hop the fence into restricted industrial grounds.",
  };
  const refHazardCheck = interceptReflectionSafety(hazardousReflection);
  assert(!refHazardCheck.isSafe, "Blocked hazardous trespassing recommendation in reflection");
  assert(
    refHazardCheck.sanitizedOutput.nextRecommendation.includes("park") ||
    refHazardCheck.sanitizedOutput.nextRecommendation.includes("trail"),
    "Sanitized hazardous recommendation with safe outdoor alternative"
  );

  // Test Suite 5: Genuine Streak and Stats Calculation
  console.log("\n[Test Suite 5: Streak and Stats Calculation]");
  const emptyStats = calculateOutdoorStats([]);
  assert(emptyStats.currentStreakDays === 0, "New user has 0-day streak");
  assert(emptyStats.totalCompletedSessions === 0, "New user has 0 completed sessions");
  assert(emptyStats.totalOutdoorMinutes === 0, "New user has 0 outdoor minutes");

  const today = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  const mockMissions = [
    {
      id: "m1",
      activity: "walk",
      duration: 30,
      actualOutdoorMinutes: 32,
      difficulty: "easy",
      title: "Walk 1",
      description: "Walk 1",
      objectives: [],
      safetyChecklist: [],
      screenAwayPrompt: "Go outside",
      estimatedOutdoorMinutes: 30,
      provider: "demo",
      modelName: "demo",
      createdAt: yesterday,
      completedAt: yesterday,
      status: "completed",
      discoveries: [validDiscovery],
    },
    {
      id: "m2",
      activity: "walk",
      duration: 20,
      actualOutdoorMinutes: 20,
      difficulty: "easy",
      title: "Walk 2",
      description: "Walk 2",
      objectives: [],
      safetyChecklist: [],
      screenAwayPrompt: "Go outside",
      estimatedOutdoorMinutes: 20,
      provider: "demo",
      modelName: "demo",
      createdAt: today,
      completedAt: today,
      status: "completed",
      discoveries: [],
    },
  ];

  const calculatedStats = calculateOutdoorStats(mockMissions);
  assert(calculatedStats.totalCompletedSessions === 2, "Accurately calculated completed sessions (2)");
  assert(calculatedStats.totalOutdoorMinutes === 52, "Accurately calculated outdoor minutes (52m)");
  assert(calculatedStats.totalDiscoveries === 1, "Accurately counted discoveries (1)");
  assert(calculatedStats.currentStreakDays === 2, "Accurately calculated 2-day consecutive streak");
  assert(calculatedStats.favoriteActivity === "walk", "Identified favorite activity ('walk')");

  console.log(`\n========================================`);
  console.log(`TOTAL: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
