import {
  AIMissionRawOutput,
  JournalReflectionRaw,
  MissionRequest,
  ReflectionRequest,
} from "../schemas/mission";
import { AIProvider, ProviderHealth, ProviderInfo } from "./types";

interface ActivityTemplate {
  titles: string[];
  descriptions: string[];
  objectivesPool: Array<{ title: string; description: string; minDifficulty?: string }>;
  safetyTips: string[];
  screenPrompts: string[];
}

const TEMPLATES: Record<string, ActivityTemplate> = {
  walk: {
    titles: [
      "Mindful Canopy & Horizon Walk",
      "Sensory Stride Through Green Corridors",
      "Neighborhood Foliage Discovery Loop",
      "Quiet Paths & Micro-Ecosystem Walk",
    ],
    descriptions: [
      "Step into the outdoors with soft visual focus. Pay close attention to subtle shifts in air, scent, and greenery.",
      "A calm walking exploration engineered to reset your visual field and ground your thoughts in nature.",
    ],
    objectivesPool: [
      {
        title: "Find three distinct leaf shapes",
        description: "Spot simple, compound, and needle-like leaves along your path without picking them.",
      },
      {
        title: "Identify a natural transition line",
        description: "Notice where managed asphalt or stone meets wild soil, moss, or creeping plants.",
      },
      {
        title: "Listen for two layered bird calls",
        description: "Pause for 60 seconds and discern between nearby calls and distant territory songs.",
      },
      {
        title: "Notice wind movement in tree canopies",
        description: "Observe which branch tiers sway first when a breeze passes through.",
      },
      {
        title: "Locate a tree with textured bark",
        description: "Touch the furrowed patterns of mature tree bark to ground your sense of touch.",
      },
    ],
    safetyTips: [
      "Stay strictly on public paths and designated crosswalks.",
      "Keep aware of bicyclists and foot traffic on shared corridors.",
      "Turn back if approaching dusk without reflective gear.",
    ],
    screenPrompts: [
      "Your phone is no longer needed. Tuck it away and let the footpath lead your thoughts.",
      "Screen off, eyes wide. The real world has higher resolution than any display.",
    ],
  },
  run: {
    titles: [
      "Trail Rhythm & Fresh Air Stride",
      "Greenway Cadence & Sensory Run",
      "Park Perimeter Interval Stride",
      "Breeze & Elevation Natural Run",
    ],
    descriptions: [
      "An energizing outdoor run focused on breathing cadence and outdoor atmosphere rather than screen stats.",
      "Run with rhythmic awareness, observing changes in terrain, wind direction, and foliage color.",
    ],
    objectivesPool: [
      {
        title: "Maintain rhythmic breathing with the wind",
        description: "Match your stride count to inhaled fresh outdoor air for the first mile.",
      },
      {
        title: "Note three physical landmarks",
        description: "Spot a distinct rock formation, an ancient tree, and a bend in the path.",
      },
      {
        title: "Feel ambient temperature changes",
        description: "Notice cooler air pockets under thick canopy versus open sunny clearings.",
      },
      {
        title: "Run a steady cadence without checking a watch",
        description: "Rely purely on internal perceived exertion and heart rhythm.",
      },
    ],
    safetyTips: [
      "Watch for uneven trail surfaces, exposed roots, and loose gravel.",
      "Yield courteously to walkers, children, and pets on trails.",
      "Carry water if exercising in direct sun or high humidity.",
    ],
    screenPrompts: [
      "No notifications, no screen glances. Pocket your device and let your legs carry you into the open air.",
      "Unplug from digital pace metrics. Run by instinct and open horizons.",
    ],
  },
  explore: {
    titles: [
      "Hidden Green Pockets Expedition",
      "Uncharted Neighborhood Tree Safari",
      "Stream & Flora Compass Quest",
      "Overlooked Micro-Wilderness Exploration",
    ],
    descriptions: [
      "Wander off your everyday routine paths. Seek out tucked-away gardens, pocket parks, and overgrown hedgerows.",
      "A curious expedition that treats your local environment as an uncharted natural territory.",
    ],
    objectivesPool: [
      {
        title: "Take two turns you have never taken before",
        description: "Choose a side trail or quiet green lane that you usually walk past.",
      },
      {
        title: "Document an ancient tree in memory",
        description: "Observe root flare, canopy spread, and lichen patterns on the oldest tree in view.",
      },
      {
        title: "Find a natural seed disperser",
        description: "Look for winged maple seeds, dandelion fluff, or burrs catching on branches.",
      },
      {
        title: "Discover moving water or drainage ecology",
        description: "Observe rainwater run-off channels, a creek, or a pond edge harboring marsh grass.",
      },
    ],
    safetyTips: [
      "Respect all private property lines and never bypass closed gates.",
      "Keep your bearings relative to recognizable major public thoroughfares.",
      "Avoid poorly lit or dense off-trail undergrowth.",
    ],
    screenPrompts: [
      "Put your screen to sleep. Let curiosity and birdsong be your true navigation compass.",
      "True exploration starts when you stop staring down at a digital map.",
    ],
  },
  birding: {
    titles: [
      "Acoustic Canopy & Wing Watch",
      "Bird Song Territory Mapping",
      "Hedgerow & Rooftop Avian Survey",
      "Quiet Perch & Flight Pattern Hunt",
    ],
    descriptions: [
      "Practice quiet observation. Train your ears to pick out avian communication and spot flitting silhouettes.",
      "A stealthy, mindful outdoor vigil dedicated to the winged wildlife sharing your local biome.",
    ],
    objectivesPool: [
      {
        title: "Distinguish between high and low-pitched calls",
        description: "Isolate songbird whistles from deeper crow, dove, or waterfowl vocalizations.",
      },
      {
        title: "Spot a bird perched above eye level",
        description: "Look along utility wires, high branch forks, or chimney peaks for sentinel birds.",
      },
      {
        title: "Observe foraging behavior",
        description: "Watch a bird foraging for seeds on grass, insects on bark, or berries on bushes.",
      },
      {
        title: "Count distinct flight patterns",
        description: "Compare undulated dipping flights of finches with direct glides of pigeons or raptors.",
      },
    ],
    safetyTips: [
      "Keep a respectful distance from nesting boxes and dense shrubs.",
      "Never bait or play artificial recorded calls that stress territorial birds.",
      "Watch your footing while looking up toward the treetops.",
    ],
    screenPrompts: [
      "Quiet your footsteps, pocket your phone, and let the songs of the trees reveal themselves.",
      "Birds notice screen glare. Darken your device and listen with full presence.",
    ],
  },
  gardening: {
    titles: [
      "Soil Ecology & Seasonal Foliage Audit",
      "Pollinator & Native Bloom Inspection",
      "Leaf Texture & Micro-Fauna Study",
      "Root & Shoot Observation Mission",
    ],
    descriptions: [
      "Get up close with soil, mulch, petals, and leaves. Observe the thriving life cycle within reach of your hands.",
      "An intimate tactile study of botanical resilience right outside your door.",
    ],
    objectivesPool: [
      {
        title: "Inspect underside of five leaves",
        description: "Look for aphid shelters, ladybugs, spider webs, or fungal spore patterns.",
      },
      {
        title: "Feel damp soil texture",
        description: "Pick up a pinch of topsoil or mulch and note aroma, grit, and moisture content.",
      },
      {
        title: "Track a visiting pollinator",
        description: "Follow a bee, hoverfly, or butterfly from bloom to bloom for two minutes.",
      },
      {
        title: "Identify seed pods or spent flowers",
        description: "Observe nature's transition from bright blossom into protective seed capsule.",
      },
    ],
    safetyTips: [
      "Wear garden gloves when handling thorny plants or working in unfamiliar mulch.",
      "Wash hands thoroughly after handling wild plants and soil.",
      "Avoid disturbing stinging insect ground nests.",
    ],
    screenPrompts: [
      "Put your phone away. There is more wisdom in healthy soil than in any endless feed.",
      "Screen time yields notifications; outdoor garden time yields oxygen and calm.",
    ],
  },
  "nature-discovery": {
    titles: [
      "Tactile Nature & Micro-Texture Safari",
      "Sunlight Angles & Shadow Landscape Hunt",
      "Lichen, Moss & Stone Geological Quest",
      "Elemental Senses: Wind, Wood & Earth",
    ],
    descriptions: [
      "Awaken your senses to microscopic patterns in bark, stone, and morning dew that normally go unnoticed.",
      "A rich grounding journey into local biodiversity, focusing on texture, scent, and natural geometry.",
    ],
    objectivesPool: [
      {
        title: "Examine three types of moss or lichen",
        description: "Notice crusty, leafy, or velvety growths thriving on stone walls or tree bases.",
      },
      {
        title: "Trace the geometry of sunlight through leaves",
        description: "Observe dapple patterns on ground surfaces and follow how wind bends the light beams.",
      },
      {
        title: "Smell two distinct botanical aromas",
        description: "Crush a fallen pine needle or bruised leaf and inhale the natural terpenes.",
      },
      {
        title: "Spot nature reclaiming a man-made surface",
        description: "Find grass pushing through sidewalk cracks or ivy scaling old brick masonry.",
      },
    ],
    safetyTips: [
      "Do not taste wild berries, mushrooms, or unfamiliar flora.",
      "Watch step on wet mossy rocks or slippery timber.",
      "Leave natural items where you found them — take only memories and observations.",
    ],
    screenPrompts: [
      "Store your phone safely in your pocket. The natural world is ready to be discovered.",
      "Close the screen. Open your eyes, ears, and lungs to the living world around you.",
    ],
  },
};

export class DemoProvider implements AIProvider {
  readonly id = "demo" as const;

  readonly info: ProviderInfo = {
    id: "demo",
    name: "Demo Provider (Instant / Zero-Setup)",
    description: "Built-in dynamic deterministic generator designed for instant testing and Hacktoberfest judging.",
    isOpenSource: true,
    requiresLocalServer: false,
    model: "verda-demo-v1",
  };

  async checkHealth(): Promise<ProviderHealth> {
    return {
      isAvailable: true,
      checkedAt: new Date().toISOString(),
      message: "Demo provider is active and ready locally.",
      modelsFound: ["verda-demo-v1"],
    };
  }

  async generateMission(request: MissionRequest): Promise<AIMissionRawOutput> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const template = TEMPLATES[request.activity] || TEMPLATES.walk;
    const titleIndex = Math.floor(Math.random() * template.titles.length);
    const descIndex = Math.floor(Math.random() * template.descriptions.length);
    const screenPromptIndex = Math.floor(Math.random() * template.screenPrompts.length);

    const targetCount = request.duration <= 15 ? 2 : request.duration <= 30 ? 3 : 4;
    const shuffled = [...template.objectivesPool].sort(() => 0.5 - Math.random());
    const selectedObjectives = shuffled.slice(0, targetCount);

    return {
      title: `${request.duration}-Min ${template.titles[titleIndex]}`,
      description: template.descriptions[descIndex],
      estimatedOutdoorMinutes: request.duration,
      objectives: selectedObjectives,
      safetyChecklist: template.safetyTips,
      screenAwayPrompt: template.screenPrompts[screenPromptIndex],
    };
  }

  async generateReflection(request: ReflectionRequest): Promise<JournalReflectionRaw> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const completedCount = request.objectives.filter((o) => o.completed).length;
    const totalCount = request.objectives.length;
    const hasDiscoveries = request.discoveries.length > 0;

    // Build realistic dynamic highlights from user's actual discoveries
    const highlights: string[] = [];
    if (hasDiscoveries) {
      for (const d of request.discoveries) {
        const prefix = d.type === "photo" ? "📸 Captured" : d.type === "voice" ? "🎙️ Heard/Spoken" : "📝 Observed";
        highlights.push(`${prefix}: ${d.note}`);
      }
    } else {
      highlights.push(`Mindful immersion across ${request.actualDuration} screen-free minutes.`);
      if (completedCount > 0) {
        highlights.push(`Focused on field objectives without checking digital feeds.`);
      } else {
        highlights.push(`Unstructured outdoor wandering and sensory resets.`);
      }
    }

    // Determine mood
    const mood: JournalReflectionRaw["mood"] =
      request.actualDuration >= 45
        ? "grounded"
        : hasDiscoveries
        ? "curious"
        : completedCount === totalCount
        ? "refreshed"
        : "calm";

    // Build grounded reflection
    const activityName = request.activity.replace("-", " ");
    let reflectionText = `You stepped away from the screen for ${request.actualDuration} outdoor minutes. `;

    if (hasDiscoveries) {
      const firstNote = request.discoveries[0].note;
      reflectionText += `Noticing "${firstNote}" shows the kind of direct perceptual presence that only happens when the phone stays in your pocket. `;
    } else {
      reflectionText += `Even without documenting every detail, taking time to feel the ambient outdoor temperature and hear open-air soundscapes recalibrates your nervous system. `;
    }

    if (completedCount > 0) {
      reflectionText += `Completing ${completedCount} of ${totalCount} field cues gave your walk intentional direction.`;
    } else {
      reflectionText += `Free exploration with zero rigid checklists is often the most restorative way to touch grass.`;
    }

    // Next adventure idea
    const nextIdeas = [
      `Try stepping outside at dawn or dusk tomorrow to experience the shift in bird territory songs.`,
      `Explore a path perpendicular to today's route to map new tree canopies.`,
      `Bring curiosity to micro-textures like bark lichens and wall moss along a quiet alleyway.`,
      `Take a 15-minute garden or balcony vigil observing pollinator visits on open flowers.`,
    ];
    const nextRec = nextIdeas[Math.floor(Math.random() * nextIdeas.length)];

    return {
      summary: `Completed ${request.actualDuration} minutes of screen-free ${activityName} with ${request.discoveries.length} discovery item(s) recorded.`,
      discoveriesHighlight: highlights.slice(0, 4),
      reflection: reflectionText,
      mood,
      nextRecommendation: nextRec,
    };
  }
}
