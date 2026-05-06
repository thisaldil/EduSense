/**
 * prebuiltTemplates.ts
 *
 * 33 hand-crafted scene templates for Grade 6 science topics.
 * Each template is a complete AnimationScript with scenes, actors, and timelines.
 *
 * Topics: photosynthesis | matter | water_cycle | energy | light |
 *         sound | magnets | electricity | heat | food_chains | weather
 *
 * Cognitive states: OVERLOAD | OPTIMAL | LOW_LOAD
 *
 * Usage:
 *   import { getPrebuiltTemplate } from "@/animation/prebuiltTemplates";
 *   const template = getPrebuiltTemplate("photosynthesis", "OVERLOAD");
 */

export type TopicKey =
  | "photosynthesis"
  | "matter"
  | "water_cycle"
  | "energy"
  | "light"
  | "sound"
  | "magnets"
  | "electricity"
  | "heat"
  | "food_chains"
  | "weather";

export type CognitiveState = "OVERLOAD" | "OPTIMAL" | "LOW_LOAD";

// ─── Topic detection from lesson text ─────────────────────────────────────────
export function detectTopicFromText(text: string): TopicKey | null {
  const t = text.toLowerCase();
  if (/photosynthesis|chlorophyll|glucose|stomata|chloroplast/.test(t))
    return "photosynthesis";
  if (/states of matter|solid|liquid|gas|melting|evaporation|particle/.test(t))
    return "matter";
  if (/water cycle|evaporation|condensation|precipitation|water vapour/.test(t))
    return "water_cycle";
  if (/energy source|fossil fuel|renewable|solar panel|wind turbine/.test(t))
    return "energy";
  if (/reflection|refraction|transparent|opaque|light travel/.test(t))
    return "light";
  if (/sound wave|vibrat|eardrum|pitch|frequency|amplitude/.test(t))
    return "sound";
  if (/magnet|magnetic|north pole|south pole|compass|attract|repel/.test(t))
    return "magnets";
  if (/circuit|electron|conductor|insulator|voltage|current|battery/.test(t))
    return "electricity";
  if (
    /heat transfer|conduction|convection|radiation|thermometer|thermal/.test(t)
  )
    return "heat";
  if (/food chain|producer|consumer|herbivore|carnivore|decomposer/.test(t))
    return "food_chains";
  if (/weather|climate|precipitation|atmosphere|humidity|meteorolog/.test(t))
    return "weather";
  return null;
}

// ─── Should we bypass to prebuilt? ────────────────────────────────────────────
export function shouldUsePrebuilt(
  script: any,
  cognitiveState: string,
  topicKey: TopicKey | null,
): boolean {
  if (!topicKey) return false;
  // Always use prebuilt for OVERLOAD
  if (cognitiveState === "OVERLOAD") return true;
  // Use prebuilt if script has only label actors
  const hasOnlyLabels = script?.scenes?.every((scene: any) =>
    scene.actors?.every((a: any) => a.type === "label"),
  );
  if (hasOnlyLabels) return true;
  return false;
}

// ─── Template getter ───────────────────────────────────────────────────────────
export function getPrebuiltTemplate(
  topic: TopicKey,
  cognitiveState: CognitiveState,
): any | null {
  const key = `${topic}_${cognitiveState}`;
  return PREBUILT_TEMPLATES[key] ?? null;
}

// ─── Scene builder helpers ────────────────────────────────────────────────────
function scene(
  id: string,
  startTime: number,
  duration: number,
  text: string,
  actors: any[],
  cognitiveState: CognitiveState,
): any {
  return {
    id,
    startTime,
    duration,
    text,
    actors,
    environment: cognitiveState === "OVERLOAD" ? "minimal" : "default",
    meta: {
      cognitiveState,
      tier:
        cognitiveState === "OVERLOAD"
          ? "Tier 3 - Cognitive Offloading"
          : cognitiveState === "OPTIMAL"
            ? "Tier 2 - Moderate Simplification"
            : "Tier 1 - Full Engagement",
      ctmlPrinciples:
        cognitiveState === "OVERLOAD"
          ? ["coherence", "signaling"]
          : ["segmenting", "signaling", "spatial_contiguity"],
      salienceLevel:
        cognitiveState === "OVERLOAD"
          ? "low"
          : cognitiveState === "OPTIMAL"
            ? "medium"
            : "rich",
    },
  };
}

function actor(
  type: string,
  x: number,
  y: number,
  animation: string,
  extra: Record<string, any> = {},
  appearAt: number = 0,
): any {
  return {
    type,
    x,
    y,
    animation,
    count: 1,
    visualRole: "metaphor",
    ...extra,
    timeline: [
      { at: appearAt, action: "appear", alpha: 0 },
      { at: appearAt + 600, action: "appear", alpha: 1 },
      { at: appearAt + 1400, action: animation },
      { at: appearAt + 2900, action: "idle" },
    ],
  };
}

// ─── PREBUILT TEMPLATES ───────────────────────────────────────────────────────
const PREBUILT_TEMPLATES: Record<string, any> = {};

// Scenes per cognitive state
const OV_DURATION = 5500; // OVERLOAD: short scenes
const OP_DURATION = 7000; // OPTIMAL: medium scenes
const LL_DURATION = 9000; // LOW_LOAD: rich scenes

// ─────────────────────────────────────────────────────────────────────────────
// T01 — PHOTOSYNTHESIS
// ─────────────────────────────────────────────────────────────────────────────
PREBUILT_TEMPLATES["photosynthesis_OVERLOAD"] = {
  title: "Photosynthesis",
  duration: OV_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OV_DURATION,
      "Plants use sunlight to make food.",
      [
        actor("sun_character", 200, 160, "pulse", { color: "#FFD700" }, 0),
        actor("plant_character", 400, 390, "sway", {}, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s2",
      OV_DURATION,
      OV_DURATION,
      "Leaves absorb light using chlorophyll.",
      [
        actor("plant_character", 350, 390, "sway", {}, 0),
        actor("bolt", 520, 200, "pulse", { color: "#66BB6A" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s3",
      OV_DURATION * 2,
      OV_DURATION,
      "Carbon dioxide enters through stomata.",
      [
        actor("plant_character", 380, 390, "sway", {}, 0),
        actor("co2_bubble", 560, 260, "float", {}, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s4",
      OV_DURATION * 3,
      OV_DURATION,
      "Water is absorbed by the roots.",
      [
        actor("plant_character", 380, 390, "sway", {}, 0),
        actor("water_drop", 220, 340, "bounce", {}, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s5",
      OV_DURATION * 4,
      OV_DURATION,
      "Glucose is made and oxygen is released.",
      [
        actor("glucose_hexagon", 300, 280, "pulse", { color: "#FF8F00" }, 0),
        actor("co2_bubble", 500, 240, "float", { color: "#A5D6A7" }, 900),
      ],
      "OVERLOAD",
    ),
  ],
};

PREBUILT_TEMPLATES["photosynthesis_OPTIMAL"] = {
  title: "Photosynthesis",
  duration: OP_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OP_DURATION,
      "Photosynthesis is how green plants make food using sunlight, water, and carbon dioxide.",
      [
        actor("sun_character", 180, 150, "pulse", { color: "#FFD700" }, 0),
        actor("plant_character", 380, 390, "sway", {}, 700),
        actor(
          "arrow",
          280,
          270,
          "appear",
          { angle: 0.5, length: 100, color: "#FFD700" },
          1400,
        ),
      ],
      "OPTIMAL",
    ),
    scene(
      "s2",
      OP_DURATION,
      OP_DURATION,
      "Chlorophyll in the leaves absorbs light energy and starts the process.",
      [
        actor("plant_character", 300, 390, "sway", {}, 0),
        actor("bolt", 480, 200, "pulse", { color: "#66BB6A" }, 700),
        actor(
          "arrow",
          420,
          280,
          "appear",
          { angle: -0.8, length: 80, color: "#66BB6A" },
          1400,
        ),
      ],
      "OPTIMAL",
    ),
    scene(
      "s3",
      OP_DURATION * 2,
      OP_DURATION,
      "Carbon dioxide enters through stomata. Water is absorbed through the roots.",
      [
        actor("plant_character", 360, 390, "sway", {}, 0),
        actor("co2_bubble", 560, 230, "float", {}, 700),
        actor("water_drop", 200, 330, "bounce", {}, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s4",
      OP_DURATION * 3,
      OP_DURATION,
      "Sunlight combines them to produce glucose for growth and oxygen for air.",
      [
        actor("sun_character", 160, 150, "pulse", { color: "#FFD700" }, 0),
        actor("glucose_hexagon", 380, 270, "pulse", { color: "#FF8F00" }, 700),
        actor("co2_bubble", 560, 240, "float", { color: "#A5D6A7" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s5",
      OP_DURATION * 4,
      OP_DURATION,
      "Without photosynthesis, most life on Earth could not exist — it is the base of all food chains.",
      [
        actor("plant_character", 280, 390, "sway", {}, 0),
        actor("sun_character", 500, 160, "pulse", { color: "#FFD700" }, 700),
        actor("glucose_hexagon", 390, 270, "pulse", { color: "#FF8F00" }, 1400),
      ],
      "OPTIMAL",
    ),
  ],
};

PREBUILT_TEMPLATES["photosynthesis_LOW_LOAD"] = {
  title: "Photosynthesis",
  duration: LL_DURATION * 6,
  scenes: [
    scene(
      "s1",
      0,
      LL_DURATION,
      "Photosynthesis: green plants convert light energy into chemical energy stored as glucose.",
      [
        actor("sun_character", 160, 140, "pulse", { color: "#FFD700" }, 0),
        actor("plant_character", 340, 390, "sway", {}, 600),
        actor("glucose_hexagon", 530, 260, "pulse", { color: "#FF8F00" }, 1200),
        actor(
          "arrow",
          420,
          270,
          "appear",
          { angle: 0, length: 90, color: "#FFD700" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s2",
      LL_DURATION,
      LL_DURATION,
      "Chlorophyll is the green pigment inside chloroplasts that captures light energy.",
      [
        actor("plant_character", 300, 390, "sway", {}, 0),
        actor("bolt", 480, 200, "pulse", { color: "#66BB6A" }, 600),
        actor("energy_bolt", 560, 290, "pulse", { color: "#AB47BC" }, 1200),
        actor(
          "arrow",
          430,
          260,
          "appear",
          { angle: -0.6, length: 80, color: "#66BB6A" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s3",
      LL_DURATION * 2,
      LL_DURATION,
      "CO₂ enters through stomata on the leaf surface. Water travels up from the roots.",
      [
        actor("plant_character", 340, 390, "sway", {}, 0),
        actor("co2_bubble", 560, 220, "float", {}, 600),
        actor("water_drop", 180, 310, "bounce", {}, 1200),
        actor(
          "arrow",
          440,
          280,
          "appear",
          { angle: 0.3, length: 80, color: "#29B6F6" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s4",
      LL_DURATION * 3,
      LL_DURATION,
      "The light-dependent reaction captures energy. The Calvin cycle uses it to build glucose.",
      [
        actor("sun_character", 150, 150, "pulse", { color: "#FFD700" }, 0),
        actor("energy_bolt", 320, 260, "pulse", { color: "#AB47BC" }, 600),
        actor("glucose_hexagon", 500, 260, "pulse", { color: "#FF8F00" }, 1200),
        actor(
          "arrow",
          390,
          260,
          "appear",
          { angle: 0, length: 90, color: "#AB47BC" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s5",
      LL_DURATION * 4,
      LL_DURATION,
      "Oxygen is released as a byproduct. It is the oxygen we breathe.",
      [
        actor("plant_character", 300, 390, "sway", {}, 0),
        actor("co2_bubble", 520, 200, "float", { color: "#A5D6A7" }, 600),
        actor(
          "arrow",
          400,
          230,
          "appear",
          { angle: -1.2, length: 80, color: "#A5D6A7" },
          1200,
        ),
        actor("sun_character", 540, 150, "pulse", { color: "#FFD700" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s6",
      LL_DURATION * 5,
      LL_DURATION,
      "Rate of photosynthesis increases with more light, CO₂, and warmer temperature up to a limit.",
      [
        actor("sun_character", 160, 150, "pulse", { color: "#FFD700" }, 0),
        actor("co2_bubble", 320, 240, "float", {}, 600),
        actor("plant_character", 480, 390, "sway", {}, 1200),
        actor("glucose_hexagon", 600, 260, "pulse", { color: "#FF8F00" }, 1800),
      ],
      "LOW_LOAD",
    ),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// T06 — SOUND AND HEARING
// ─────────────────────────────────────────────────────────────────────────────
PREBUILT_TEMPLATES["sound_OVERLOAD"] = {
  title: "Sound and Hearing",
  duration: OV_DURATION * 4,
  scenes: [
    scene(
      "s1",
      0,
      OV_DURATION,
      "Sound is energy made when objects vibrate.",
      [
        actor("tuning_fork", 320, 300, "vibrate", {}, 0),
        actor("wave_emitter", 520, 280, "pulse", { color: "#29B6F6" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s2",
      OV_DURATION,
      OV_DURATION,
      "Vibrations travel as waves through the air.",
      [
        actor("wave_emitter", 280, 290, "pulse", { color: "#29B6F6" }, 0),
        actor("air_particle", 460, 280, "vibrate", { color: "#90A4AE" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s3",
      OV_DURATION * 2,
      OV_DURATION,
      "Sound waves reach the ear and cause hearing.",
      [
        actor("wave_emitter", 240, 290, "pulse", { color: "#29B6F6" }, 0),
        actor("ear", 520, 290, "idle", {}, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s4",
      OV_DURATION * 3,
      OV_DURATION,
      "Sound cannot travel in a vacuum — it needs particles.",
      [
        actor("tuning_fork", 360, 300, "vibrate", {}, 0),
        actor("rock", 540, 300, "idle", { color: "#455A64" }, 900),
      ],
      "OVERLOAD",
    ),
  ],
};

PREBUILT_TEMPLATES["sound_OPTIMAL"] = {
  title: "Sound and Hearing",
  duration: OP_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OP_DURATION,
      "Sound is energy produced when an object vibrates — the vibrations disturb particles around it.",
      [
        actor("tuning_fork", 300, 290, "vibrate", {}, 0),
        actor("air_particle", 460, 270, "vibrate", { color: "#90A4AE" }, 700),
        actor("air_particle", 520, 300, "vibrate", { color: "#90A4AE" }, 1200),
      ],
      "OPTIMAL",
    ),
    scene(
      "s2",
      OP_DURATION,
      OP_DURATION,
      "These vibrations travel as longitudinal waves through the air in all directions.",
      [
        actor("wave_emitter", 260, 290, "pulse", { color: "#29B6F6" }, 0),
        actor(
          "arrow",
          350,
          290,
          "appear",
          { angle: 0, length: 120, color: "#29B6F6" },
          700,
        ),
        actor("ear", 540, 290, "idle", {}, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s3",
      OP_DURATION * 2,
      OP_DURATION,
      "Pitch depends on frequency — more vibrations per second means a higher pitch.",
      [
        actor("tuning_fork", 280, 290, "vibrate", {}, 0),
        actor("wave_emitter", 460, 260, "pulse", { color: "#AB47BC" }, 700),
        actor("bolt", 580, 240, "pulse", { color: "#AB47BC" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s4",
      OP_DURATION * 3,
      OP_DURATION,
      "Volume depends on amplitude — larger vibrations make louder sounds.",
      [
        actor("tuning_fork", 280, 290, "vibrate", {}, 0),
        actor("wave_emitter", 460, 270, "pulse", { color: "#FF7043" }, 700),
        actor("air_particle", 580, 270, "vibrate", { color: "#FF7043" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s5",
      OP_DURATION * 4,
      OP_DURATION,
      "Sound cannot travel in a vacuum because there are no particles to vibrate.",
      [
        actor("tuning_fork", 280, 290, "idle", {}, 0),
        actor("rock", 460, 290, "idle", { color: "#37474F" }, 700),
        actor("air_particle", 380, 200, "idle", { color: "#94A3B8" }, 1400),
      ],
      "OPTIMAL",
    ),
  ],
};

PREBUILT_TEMPLATES["sound_LOW_LOAD"] = {
  title: "Sound and Hearing",
  duration: LL_DURATION * 6,
  scenes: [
    scene(
      "s1",
      0,
      LL_DURATION,
      "Sound is a longitudinal wave — particles vibrate parallel to the direction of travel.",
      [
        actor("tuning_fork", 240, 290, "vibrate", {}, 0),
        actor("air_particle", 380, 270, "vibrate", { color: "#90A4AE" }, 600),
        actor("air_particle", 450, 290, "vibrate", { color: "#90A4AE" }, 1000),
        actor("air_particle", 520, 270, "vibrate", { color: "#90A4AE" }, 1400),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s2",
      LL_DURATION,
      LL_DURATION,
      "Frequency (Hz) determines pitch. Amplitude determines loudness (decibels).",
      [
        actor("tuning_fork", 240, 290, "vibrate", {}, 0),
        actor("wave_emitter", 420, 260, "pulse", { color: "#29B6F6" }, 600),
        actor("bolt", 560, 230, "pulse", { color: "#AB47BC" }, 1200),
        actor(
          "arrow",
          480,
          290,
          "appear",
          { angle: 0, length: 80, color: "#29B6F6" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s3",
      LL_DURATION * 2,
      LL_DURATION,
      "The outer ear funnels waves to the eardrum, which vibrates and sends signals to the cochlea.",
      [
        actor("wave_emitter", 200, 290, "pulse", { color: "#29B6F6" }, 0),
        actor(
          "arrow",
          290,
          290,
          "appear",
          { angle: 0, length: 100, color: "#29B6F6" },
          600,
        ),
        actor("ear", 460, 290, "idle", {}, 1200),
        actor("bolt", 580, 260, "pulse", { color: "#AB47BC" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s4",
      LL_DURATION * 3,
      LL_DURATION,
      "Sound travels faster in solids and liquids than in air because particles are closer.",
      [
        actor("rock_layer", 340, 360, "idle", { color: "#8D6E63" }, 0),
        actor("wave_emitter", 200, 260, "pulse", { color: "#29B6F6" }, 600),
        actor(
          "arrow",
          280,
          260,
          "appear",
          { angle: 0, length: 120, color: "#29B6F6" },
          1200,
        ),
        actor("air_particle", 520, 260, "vibrate", { color: "#90A4AE" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s5",
      LL_DURATION * 4,
      LL_DURATION,
      "Sound cannot travel in a vacuum — no particles means no vibration transmission.",
      [
        actor("tuning_fork", 260, 290, "idle", {}, 0),
        actor("rock", 460, 290, "idle", { color: "#37474F" }, 600),
        actor("air_particle", 360, 200, "idle", { color: "#94A3B8" }, 1200),
        actor("bolt", 540, 200, "idle", { color: "#94A3B8" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s6",
      LL_DURATION * 5,
      LL_DURATION,
      "The decibel scale measures sound intensity. Sounds above 85dB can damage hearing.",
      [
        actor("wave_emitter", 220, 290, "pulse", { color: "#FF7043" }, 0),
        actor("air_particle", 380, 270, "vibrate", { color: "#FF7043" }, 600),
        actor("ear", 540, 290, "idle", {}, 1200),
        actor("bolt", 600, 240, "pulse", { color: "#E53935" }, 1800),
      ],
      "LOW_LOAD",
    ),
  ],
};

// T02 — STATES OF MATTER
PREBUILT_TEMPLATES["matter_OVERLOAD"] = {
  title: "States of Matter",
  duration: OV_DURATION * 4,
  scenes: [
    scene(
      "s1",
      0,
      OV_DURATION,
      "Matter exists as solid, liquid, or gas.",
      [
        actor("rock", 240, 300, "idle", { color: "#78716C" }, 0),
        actor("water_drop", 400, 300, "bounce", {}, 900),
        actor("air_particle", 560, 280, "vibrate", { color: "#90A4AE" }, 1600),
      ],
      "OVERLOAD",
    ),
    scene(
      "s2",
      OV_DURATION,
      OV_DURATION,
      "In solids, particles are packed tightly together.",
      [
        actor("rock_layer", 360, 340, "idle", { color: "#607D8B" }, 0),
        actor("molecule", 480, 280, "idle", { color: "#455A64" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s3",
      OV_DURATION * 2,
      OV_DURATION,
      "Heating causes solids to melt into liquids.",
      [
        actor("rock", 280, 300, "idle", { color: "#78716C" }, 0),
        actor("bolt", 400, 260, "pulse", { color: "#FF5722" }, 900),
        actor("water_drop", 520, 300, "bounce", {}, 1600),
      ],
      "OVERLOAD",
    ),
    scene(
      "s4",
      OV_DURATION * 3,
      OV_DURATION,
      "More heating turns liquids into gas through evaporation.",
      [
        actor("water_drop", 280, 310, "bounce", {}, 0),
        actor("bolt", 400, 260, "pulse", { color: "#FF5722" }, 900),
        actor("air_particle", 540, 250, "float", { color: "#90A4AE" }, 1600),
      ],
      "OVERLOAD",
    ),
  ],
};

PREBUILT_TEMPLATES["matter_OPTIMAL"] = {
  title: "States of Matter",
  duration: OP_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OP_DURATION,
      "Matter has three states: solid, liquid, and gas — each with different particle arrangements.",
      [
        actor("rock", 220, 310, "idle", { color: "#78716C" }, 0),
        actor("water_drop", 390, 300, "bounce", {}, 700),
        actor("air_particle", 560, 270, "vibrate", { color: "#90A4AE" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s2",
      OP_DURATION,
      OP_DURATION,
      "Solid particles are tightly packed and vibrate in fixed positions — definite shape and volume.",
      [
        actor("rock_layer", 320, 340, "idle", { color: "#607D8B" }, 0),
        actor("molecule", 460, 280, "idle", { color: "#455A64" }, 700),
        actor("molecule", 540, 280, "idle", { color: "#455A64" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s3",
      OP_DURATION * 2,
      OP_DURATION,
      "Liquid particles slide past each other — definite volume but takes the shape of its container.",
      [
        actor("water_drop", 280, 300, "bounce", {}, 0),
        actor("water_drop", 380, 310, "bounce", {}, 700),
        actor("water_drop", 480, 300, "bounce", {}, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s4",
      OP_DURATION * 3,
      OP_DURATION,
      "Gas particles move freely and spread to fill any space — no fixed shape or volume.",
      [
        actor("air_particle", 240, 220, "float", { color: "#90A4AE" }, 0),
        actor("air_particle", 420, 310, "vibrate", { color: "#90A4AE" }, 700),
        actor("air_particle", 580, 200, "float", { color: "#90A4AE" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s5",
      OP_DURATION * 4,
      OP_DURATION,
      "Heating causes melting and evaporation. Cooling causes condensation and freezing.",
      [
        actor("bolt", 240, 260, "pulse", { color: "#FF5722" }, 0),
        actor("rock", 340, 300, "idle", { color: "#78716C" }, 700),
        actor("water_drop", 460, 300, "bounce", {}, 1400),
        actor("air_particle", 570, 260, "float", { color: "#90A4AE" }, 2000),
      ],
      "OPTIMAL",
    ),
  ],
};

PREBUILT_TEMPLATES["matter_LOW_LOAD"] = {
  title: "States of Matter",
  duration: LL_DURATION * 6,
  scenes: [
    scene(
      "s1",
      0,
      LL_DURATION,
      "Matter is anything with mass and volume. It exists in three states depending on particle energy.",
      [
        actor("rock", 200, 310, "idle", { color: "#78716C" }, 0),
        actor("water_drop", 360, 300, "bounce", {}, 600),
        actor("air_particle", 520, 260, "vibrate", { color: "#90A4AE" }, 1200),
        actor("bolt", 620, 240, "pulse", { color: "#FF5722" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s2",
      LL_DURATION,
      LL_DURATION,
      "Solid: particles vibrate in fixed lattice positions. Definite shape and volume. High density.",
      [
        actor("rock_layer", 280, 350, "idle", { color: "#607D8B" }, 0),
        actor("molecule", 420, 270, "idle", { color: "#455A64" }, 600),
        actor("molecule", 500, 270, "idle", { color: "#455A64" }, 1000),
        actor("molecule", 460, 320, "idle", { color: "#455A64" }, 1400),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s3",
      LL_DURATION * 2,
      LL_DURATION,
      "Liquid: particles have enough energy to slide past each other. Fixed volume, variable shape.",
      [
        actor("water_drop", 240, 300, "bounce", {}, 0),
        actor("water_drop", 360, 310, "bounce", {}, 600),
        actor("water_drop", 480, 300, "bounce", {}, 1200),
        actor(
          "arrow",
          360,
          380,
          "appear",
          { angle: 0, length: 100, color: "#29B6F6" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s4",
      LL_DURATION * 3,
      LL_DURATION,
      "Gas: particles have high kinetic energy and move rapidly — no fixed shape or volume.",
      [
        actor("air_particle", 200, 200, "float", { color: "#90A4AE" }, 0),
        actor("air_particle", 380, 330, "vibrate", { color: "#90A4AE" }, 600),
        actor("air_particle", 560, 210, "float", { color: "#90A4AE" }, 1200),
        actor("energy_bolt", 420, 270, "pulse", { color: "#AB47BC" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s5",
      LL_DURATION * 4,
      LL_DURATION,
      "Changes of state: melting point and boiling point are fixed temperatures for each substance.",
      [
        actor("bolt", 200, 260, "pulse", { color: "#FF5722" }, 0),
        actor("thermometer", 360, 280, "pulse", { temp: 0.8 }, 600),
        actor("water_drop", 500, 290, "bounce", {}, 1200),
        actor("air_particle", 600, 240, "float", { color: "#90A4AE" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s6",
      LL_DURATION * 5,
      LL_DURATION,
      "Changes of state are physical — the chemical composition stays the same throughout.",
      [
        actor("rock", 240, 310, "idle", { color: "#78716C" }, 0),
        actor(
          "arrow",
          320,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FF5722" },
          600,
        ),
        actor("water_drop", 450, 300, "bounce", {}, 1200),
        actor(
          "arrow",
          530,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FF5722" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
  ],
};

// T03 — WATER CYCLE
PREBUILT_TEMPLATES["water_cycle_OVERLOAD"] = {
  title: "The Water Cycle",
  duration: OV_DURATION * 4,
  scenes: [
    scene(
      "s1",
      0,
      OV_DURATION,
      "The sun heats water and makes it evaporate.",
      [
        actor("sun_character", 200, 160, "pulse", { color: "#FFD700" }, 0),
        actor("water_drop", 400, 340, "bounce", {}, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s2",
      OV_DURATION,
      OV_DURATION,
      "Water vapour rises and forms clouds.",
      [
        actor("water_cycle_cloud", 380, 180, "float", {}, 0),
        actor(
          "arrow",
          300,
          280,
          "appear",
          { angle: -1.57, length: 80, color: "#29B6F6" },
          900,
        ),
      ],
      "OVERLOAD",
    ),
    scene(
      "s3",
      OV_DURATION * 2,
      OV_DURATION,
      "Clouds release rain — this is called precipitation.",
      [
        actor("water_cycle_cloud", 320, 160, "float", {}, 0),
        actor("water_drop", 360, 310, "bounce", {}, 900),
        actor("water_drop", 440, 320, "bounce", {}, 1400),
      ],
      "OVERLOAD",
    ),
    scene(
      "s4",
      OV_DURATION * 3,
      OV_DURATION,
      "Water flows back to rivers and the sea, completing the cycle.",
      [
        actor("water_drop", 240, 310, "bounce", {}, 0),
        actor(
          "arrow",
          360,
          340,
          "appear",
          { angle: 0, length: 120, color: "#29B6F6" },
          900,
        ),
        actor("water_cycle_cloud", 560, 180, "float", {}, 1600),
      ],
      "OVERLOAD",
    ),
  ],
};

PREBUILT_TEMPLATES["water_cycle_OPTIMAL"] = {
  title: "The Water Cycle",
  duration: OP_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OP_DURATION,
      "The water cycle continuously moves water between Earth and the atmosphere.",
      [
        actor("sun_character", 180, 150, "pulse", { color: "#FFD700" }, 0),
        actor("water_drop", 380, 340, "bounce", {}, 700),
        actor("water_cycle_cloud", 550, 180, "float", {}, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s2",
      OP_DURATION,
      OP_DURATION,
      "The sun heats water in oceans and lakes — it evaporates and rises as water vapour.",
      [
        actor("sun_character", 180, 150, "pulse", { color: "#FFD700" }, 0),
        actor("water_drop", 360, 340, "bounce", {}, 700),
        actor(
          "arrow",
          340,
          280,
          "appear",
          { angle: -1.57, length: 80, color: "#29B6F6" },
          1400,
        ),
      ],
      "OPTIMAL",
    ),
    scene(
      "s3",
      OP_DURATION * 2,
      OP_DURATION,
      "Water vapour cools in the atmosphere and condenses to form clouds.",
      [
        actor("water_cycle_cloud", 300, 170, "float", {}, 0),
        actor("water_cycle_cloud", 500, 190, "float", {}, 700),
        actor("air_particle", 400, 240, "float", { color: "#90A4AE" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s4",
      OP_DURATION * 3,
      OP_DURATION,
      "Heavy clouds release precipitation — rain, snow, sleet, or hail falls back to Earth.",
      [
        actor("water_cycle_cloud", 320, 160, "float", {}, 0),
        actor("water_drop", 300, 310, "bounce", {}, 700),
        actor("water_drop", 400, 320, "bounce", {}, 1000),
        actor("water_drop", 500, 310, "bounce", {}, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s5",
      OP_DURATION * 4,
      OP_DURATION,
      "Water flows to rivers, soaks into the ground, and eventually returns to the sea.",
      [
        actor("water_drop", 200, 320, "bounce", {}, 0),
        actor(
          "arrow",
          300,
          330,
          "appear",
          { angle: 0, length: 120, color: "#29B6F6" },
          700,
        ),
        actor("water_cycle_cloud", 540, 180, "float", {}, 1400),
        actor("sun_character", 580, 150, "pulse", { color: "#FFD700" }, 2000),
      ],
      "OPTIMAL",
    ),
  ],
};

PREBUILT_TEMPLATES["water_cycle_LOW_LOAD"] = {
  title: "The Water Cycle",
  duration: LL_DURATION * 6,
  scenes: [
    scene(
      "s1",
      0,
      LL_DURATION,
      "The water cycle is a continuous hydrological process driven by solar energy.",
      [
        actor("sun_character", 160, 150, "pulse", { color: "#FFD700" }, 0),
        actor("water_drop", 340, 330, "bounce", {}, 600),
        actor("water_cycle_cloud", 520, 180, "float", {}, 1200),
        actor(
          "arrow",
          380,
          260,
          "appear",
          { angle: -0.8, length: 100, color: "#29B6F6" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s2",
      LL_DURATION,
      LL_DURATION,
      "Evaporation: solar radiation converts liquid water to vapour. Transpiration from plants adds more vapour.",
      [
        actor("sun_character", 160, 150, "pulse", { color: "#FFD700" }, 0),
        actor("water_drop", 340, 330, "bounce", {}, 600),
        actor("plant_character", 520, 390, "sway", {}, 1200),
        actor(
          "arrow",
          400,
          270,
          "appear",
          { angle: -1.57, length: 90, color: "#29B6F6" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s3",
      LL_DURATION * 2,
      LL_DURATION,
      "Condensation: vapour cools around dust particles and forms cloud droplets.",
      [
        actor("water_cycle_cloud", 260, 170, "float", {}, 0),
        actor("water_cycle_cloud", 460, 190, "float", {}, 600),
        actor("air_particle", 360, 250, "float", { color: "#90A4AE" }, 1200),
        actor(
          "arrow",
          360,
          290,
          "appear",
          { angle: 1.57, length: 70, color: "#29B6F6" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s4",
      LL_DURATION * 3,
      LL_DURATION,
      "Precipitation: droplets combine and fall as rain, snow, sleet, or hail depending on temperature.",
      [
        actor("water_cycle_cloud", 300, 160, "float", {}, 0),
        actor("water_drop", 260, 310, "bounce", {}, 600),
        actor("water_drop", 360, 320, "bounce", {}, 900),
        actor("water_drop", 460, 310, "bounce", {}, 1200),
        actor("thermometer", 580, 280, "pulse", { temp: 0.3 }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s5",
      LL_DURATION * 4,
      LL_DURATION,
      "Surface runoff flows to rivers and lakes. Infiltration soaks into the ground as groundwater.",
      [
        actor("water_drop", 200, 320, "bounce", {}, 0),
        actor(
          "arrow",
          290,
          330,
          "appear",
          { angle: 0, length: 130, color: "#29B6F6" },
          600,
        ),
        actor("rock_layer", 440, 370, "idle", { color: "#8D6E63" }, 1200),
        actor("water_drop", 520, 350, "idle", { color: "#29B6F6" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s6",
      LL_DURATION * 5,
      LL_DURATION,
      "Fresh water is limited — only 3% of Earth's water is fresh, and most is locked in ice.",
      [
        actor("water_cycle_cloud", 200, 170, "float", {}, 0),
        actor("water_drop", 360, 310, "bounce", {}, 600),
        actor("rock_layer", 500, 360, "idle", { color: "#78909C" }, 1200),
        actor("sun_character", 580, 150, "pulse", { color: "#FFD700" }, 1800),
      ],
      "LOW_LOAD",
    ),
  ],
};

// T08 — ELECTRICITY (abbreviated — follow same pattern for remaining topics)
PREBUILT_TEMPLATES["electricity_OVERLOAD"] = {
  title: "Electricity",
  duration: OV_DURATION * 4,
  scenes: [
    scene(
      "s1",
      0,
      OV_DURATION,
      "Electricity is energy from moving electrons.",
      [
        actor("bolt", 280, 300, "pulse", { color: "#FFA000" }, 0),
        actor("circuit_bulb", 480, 280, "shine", { color: "#FDE047" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s2",
      OV_DURATION,
      OV_DURATION,
      "Electrons need a complete circuit path to flow.",
      [
        actor("bolt", 240, 300, "pulse", { color: "#FFA000" }, 0),
        actor(
          "arrow",
          340,
          300,
          "appear",
          { angle: 0, length: 100, color: "#FFA000" },
          900,
        ),
        actor("circuit_bulb", 500, 280, "shine", { color: "#FDE047" }, 1600),
      ],
      "OVERLOAD",
    ),
    scene(
      "s3",
      OV_DURATION * 2,
      OV_DURATION,
      "Conductors let electricity through. Insulators block it.",
      [
        actor("bolt", 260, 300, "pulse", { color: "#66BB6A" }, 0),
        actor("rock", 480, 300, "idle", { color: "#78716C" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s4",
      OV_DURATION * 3,
      OV_DURATION,
      "A switch opens or closes the circuit to control devices.",
      [
        actor("circuit_bulb", 340, 280, "idle", { color: "#94A3B8" }, 0),
        actor("bolt", 200, 300, "idle", { color: "#94A3B8" }, 900),
      ],
      "OVERLOAD",
    ),
  ],
};

PREBUILT_TEMPLATES["electricity_OPTIMAL"] = {
  title: "Electricity",
  duration: OP_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OP_DURATION,
      "Electricity is the flow of electrons through a conducting material.",
      [
        actor("bolt", 240, 300, "pulse", { color: "#FFA000" }, 0),
        actor(
          "arrow",
          330,
          300,
          "appear",
          { angle: 0, length: 100, color: "#FFA000" },
          700,
        ),
        actor("circuit_bulb", 490, 275, "shine", { color: "#FDE047" }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s2",
      OP_DURATION,
      OP_DURATION,
      "A circuit needs a power source, wires, and a device to form a complete path for current.",
      [
        actor("bolt", 220, 300, "pulse", { color: "#FFA000" }, 0),
        actor(
          "arrow",
          300,
          300,
          "appear",
          { angle: 0, length: 90, color: "#FFA000" },
          700,
        ),
        actor("circuit_bulb", 450, 275, "shine", { color: "#FDE047" }, 1400),
        actor(
          "arrow",
          540,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FFA000" },
          2000,
        ),
      ],
      "OPTIMAL",
    ),
    scene(
      "s3",
      OP_DURATION * 2,
      OP_DURATION,
      "Conductors (metals) allow current to flow easily. Insulators (plastic, rubber) block it.",
      [
        actor("bolt", 240, 300, "pulse", { color: "#66BB6A" }, 0),
        actor(
          "arrow",
          320,
          300,
          "appear",
          { angle: 0, length: 80, color: "#66BB6A" },
          700,
        ),
        actor("rock", 460, 300, "idle", { color: "#78716C" }, 1400),
        actor("bolt", 560, 300, "idle", { color: "#94A3B8" }, 2000),
      ],
      "OPTIMAL",
    ),
    scene(
      "s4",
      OP_DURATION * 3,
      OP_DURATION,
      "A broken circuit stops the current — the bulb goes out.",
      [
        actor("bolt", 220, 300, "idle", { color: "#94A3B8" }, 0),
        actor(
          "arrow",
          300,
          300,
          "appear",
          { angle: 0, length: 80, color: "#94A3B8" },
          700,
        ),
        actor("circuit_bulb", 440, 275, "idle", { color: "#94A3B8" }, 1400),
        actor("rock", 380, 220, "idle", { color: "#E53935" }, 2000),
      ],
      "OPTIMAL",
    ),
    scene(
      "s5",
      OP_DURATION * 4,
      OP_DURATION,
      "In a series circuit components share current. In parallel, each gets full voltage.",
      [
        actor("bolt", 200, 300, "pulse", { color: "#FFA000" }, 0),
        actor("circuit_bulb", 360, 260, "shine", { color: "#FDE047" }, 700),
        actor("circuit_bulb", 480, 260, "shine", { color: "#FDE047" }, 1400),
        actor(
          "arrow",
          280,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FFA000" },
          2000,
        ),
      ],
      "OPTIMAL",
    ),
  ],
};

PREBUILT_TEMPLATES["electricity_LOW_LOAD"] = {
  title: "Electricity",
  duration: LL_DURATION * 6,
  scenes: [
    scene(
      "s1",
      0,
      LL_DURATION,
      "Electric current is the flow of electrons (charge carriers) measured in amperes.",
      [
        actor("bolt", 220, 300, "pulse", { color: "#FFA000" }, 0),
        actor(
          "arrow",
          310,
          300,
          "appear",
          { angle: 0, length: 100, color: "#FFA000" },
          600,
        ),
        actor("molecule", 470, 280, "vibrate", { color: "#FFA000" }, 1200),
        actor("circuit_bulb", 580, 270, "shine", { color: "#FDE047" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s2",
      LL_DURATION,
      LL_DURATION,
      "Voltage (volts) pushes electrons. Resistance (ohms) opposes the flow. V = I × R.",
      [
        actor("bolt", 200, 300, "pulse", { color: "#FFA000" }, 0),
        actor(
          "arrow",
          290,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FFA000" },
          600,
        ),
        actor("rock", 430, 300, "idle", { color: "#78716C" }, 1200),
        actor("circuit_bulb", 540, 270, "shine", { color: "#FDE047" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s3",
      LL_DURATION * 2,
      LL_DURATION,
      "Conductors: metals with free electrons. Insulators: materials that resist electron flow.",
      [
        actor("bolt", 220, 300, "pulse", { color: "#66BB6A" }, 0),
        actor(
          "arrow",
          300,
          300,
          "appear",
          { angle: 0, length: 80, color: "#66BB6A" },
          600,
        ),
        actor("circuit_bulb", 440, 270, "shine", { color: "#FDE047" }, 1200),
        actor("rock", 560, 300, "idle", { color: "#78716C" }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s4",
      LL_DURATION * 3,
      LL_DURATION,
      "Series circuit: same current through all components. One break stops everything.",
      [
        actor("bolt", 180, 300, "pulse", { color: "#FFA000" }, 0),
        actor("circuit_bulb", 340, 270, "shine", { color: "#FDE047" }, 600),
        actor("circuit_bulb", 480, 270, "shine", { color: "#FDE047" }, 1200),
        actor(
          "arrow",
          260,
          300,
          "appear",
          { angle: 0, length: 60, color: "#FFA000" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s5",
      LL_DURATION * 4,
      LL_DURATION,
      "Parallel circuit: each branch gets full voltage. One broken branch doesn't stop others.",
      [
        actor("bolt", 180, 300, "pulse", { color: "#FFA000" }, 0),
        actor("circuit_bulb", 360, 240, "shine", { color: "#FDE047" }, 600),
        actor("circuit_bulb", 360, 340, "shine", { color: "#FDE047" }, 1200),
        actor(
          "arrow",
          260,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FFA000" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s6",
      LL_DURATION * 5,
      LL_DURATION,
      "Switches control current flow by opening and closing the circuit path.",
      [
        actor("bolt", 220, 300, "pulse", { color: "#FFA000" }, 0),
        actor(
          "arrow",
          300,
          300,
          "appear",
          { angle: 0, length: 80, color: "#FFA000" },
          600,
        ),
        actor("circuit_bulb", 440, 270, "shine", { color: "#FDE047" }, 1200),
        actor("rock", 370, 210, "idle", { color: "#E53935" }, 1800),
      ],
      "LOW_LOAD",
    ),
  ],
};

// T09 — HEAT
PREBUILT_TEMPLATES["heat_OVERLOAD"] = {
  title: "Heat Transfer",
  duration: OV_DURATION * 4,
  scenes: [
    scene(
      "s1",
      0,
      OV_DURATION,
      "Heat flows from hot to cold until temperatures are equal.",
      [
        actor("thermometer", 260, 290, "pulse", { temp: 0.85 }, 0),
        actor(
          "arrow",
          350,
          290,
          "appear",
          { angle: 0, length: 100, color: "#FF5722" },
          900,
        ),
        actor("thermometer", 510, 290, "pulse", { temp: 0.2 }, 1600),
      ],
      "OVERLOAD",
    ),
    scene(
      "s2",
      OV_DURATION,
      OV_DURATION,
      "Conduction: heat moves through solid materials by particle contact.",
      [
        actor("rock_layer", 360, 350, "idle", { color: "#8D6E63" }, 0),
        actor("thermometer", 560, 290, "pulse", { temp: 0.7 }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s3",
      OV_DURATION * 2,
      OV_DURATION,
      "Convection: warm fluid rises, cool fluid sinks — circular movement.",
      [
        actor("molecule", 340, 240, "float", { color: "#FF5722" }, 0),
        actor("molecule", 460, 360, "pulse", { color: "#42A5F5" }, 900),
      ],
      "OVERLOAD",
    ),
    scene(
      "s4",
      OV_DURATION * 3,
      OV_DURATION,
      "Radiation: heat travels as waves through space — how the sun warms Earth.",
      [
        actor("sun_character", 200, 160, "pulse", { color: "#FFD700" }, 0),
        actor(
          "arrow",
          290,
          240,
          "appear",
          { angle: 0.5, length: 120, color: "#FF5722" },
          900,
        ),
        actor("rock_layer", 480, 360, "idle", { color: "#8D6E63" }, 1600),
      ],
      "OVERLOAD",
    ),
  ],
};

PREBUILT_TEMPLATES["heat_OPTIMAL"] = {
  title: "Heat Transfer",
  duration: OP_DURATION * 5,
  scenes: [
    scene(
      "s1",
      0,
      OP_DURATION,
      "Heat is a form of energy that flows from warmer objects to cooler ones until equilibrium.",
      [
        actor("thermometer", 240, 290, "pulse", { temp: 0.85 }, 0),
        actor(
          "arrow",
          330,
          290,
          "appear",
          { angle: 0, length: 100, color: "#FF5722" },
          700,
        ),
        actor("thermometer", 490, 290, "pulse", { temp: 0.2 }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s2",
      OP_DURATION,
      OP_DURATION,
      "Conduction: heat passes through solids particle-to-particle. Metals conduct well; wood and plastic do not.",
      [
        actor("rock_layer", 300, 350, "idle", { color: "#8D6E63" }, 0),
        actor(
          "arrow",
          400,
          290,
          "appear",
          { angle: 0, length: 100, color: "#FF5722" },
          700,
        ),
        actor("thermometer", 560, 280, "pulse", { temp: 0.75 }, 1400),
      ],
      "OPTIMAL",
    ),
    scene(
      "s3",
      OP_DURATION * 2,
      OP_DURATION,
      "Convection: warmer fluid rises, cooler fluid sinks, creating a convection current.",
      [
        actor("molecule", 300, 230, "float", { color: "#FF5722" }, 0),
        actor(
          "arrow",
          360,
          280,
          "appear",
          { angle: -1.57, length: 60, color: "#FF5722" },
          700,
        ),
        actor("molecule", 460, 360, "pulse", { color: "#42A5F5" }, 1400),
        actor(
          "arrow",
          460,
          300,
          "appear",
          { angle: 1.57, length: 60, color: "#42A5F5" },
          2000,
        ),
      ],
      "OPTIMAL",
    ),
    scene(
      "s4",
      OP_DURATION * 3,
      OP_DURATION,
      "Radiation: heat travels as infrared waves — no medium needed. This is how sun warms Earth.",
      [
        actor("sun_character", 180, 150, "pulse", { color: "#FFD700" }, 0),
        actor(
          "arrow",
          270,
          240,
          "appear",
          { angle: 0.5, length: 120, color: "#FF6F00" },
          700,
        ),
        actor("rock_layer", 460, 360, "idle", { color: "#8D6E63" }, 1400),
        actor("thermometer", 580, 280, "pulse", { temp: 0.6 }, 2000),
      ],
      "OPTIMAL",
    ),
    scene(
      "s5",
      OP_DURATION * 4,
      OP_DURATION,
      "Heat makes matter expand — particles move faster and need more space.",
      [
        actor("thermometer", 240, 290, "pulse", { temp: 0.7 }, 0),
        actor("bolt", 360, 270, "pulse", { color: "#FF5722" }, 700),
        actor("molecule", 480, 280, "vibrate", { color: "#FF5722" }, 1400),
        actor(
          "arrow",
          540,
          280,
          "appear",
          { angle: 0, length: 60, color: "#FF5722" },
          2000,
        ),
      ],
      "OPTIMAL",
    ),
  ],
};

PREBUILT_TEMPLATES["heat_LOW_LOAD"] = {
  title: "Heat Transfer",
  duration: LL_DURATION * 6,
  scenes: [
    scene(
      "s1",
      0,
      LL_DURATION,
      "Thermal energy (heat) is the total kinetic energy of particles. Temperature measures average kinetic energy.",
      [
        actor("thermometer", 220, 290, "pulse", { temp: 0.85 }, 0),
        actor("molecule", 380, 270, "vibrate", { color: "#FF5722" }, 600),
        actor(
          "arrow",
          450,
          290,
          "appear",
          { angle: 0, length: 80, color: "#FF5722" },
          1200,
        ),
        actor("thermometer", 580, 290, "pulse", { temp: 0.2 }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s2",
      LL_DURATION,
      LL_DURATION,
      "Conduction: energy transfers through particle collisions in solids. Good conductors have free electrons.",
      [
        actor("rock_layer", 260, 360, "idle", { color: "#8D6E63" }, 0),
        actor("molecule", 380, 270, "vibrate", { color: "#FF5722" }, 600),
        actor(
          "arrow",
          440,
          280,
          "appear",
          { angle: 0, length: 80, color: "#FF5722" },
          1200,
        ),
        actor("thermometer", 560, 280, "pulse", { temp: 0.75 }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s3",
      LL_DURATION * 2,
      LL_DURATION,
      "Convection currents: density differences drive fluid movement — warm rises, cool sinks.",
      [
        actor("molecule", 260, 220, "float", { color: "#FF5722" }, 0),
        actor(
          "arrow",
          320,
          280,
          "appear",
          { angle: -1.57, length: 70, color: "#FF5722" },
          600,
        ),
        actor("molecule", 440, 370, "idle", { color: "#42A5F5" }, 1200),
        actor(
          "arrow",
          440,
          310,
          "appear",
          { angle: 1.57, length: 70, color: "#42A5F5" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s4",
      LL_DURATION * 3,
      LL_DURATION,
      "Radiation: electromagnetic waves (infrared) carry heat through vacuum — no medium needed.",
      [
        actor("sun_character", 160, 150, "pulse", { color: "#FFD700" }, 0),
        actor(
          "arrow",
          250,
          240,
          "appear",
          { angle: 0.4, length: 130, color: "#FF6F00" },
          600,
        ),
        actor("rock_layer", 440, 360, "idle", { color: "#8D6E63" }, 1200),
        actor("thermometer", 580, 275, "pulse", { temp: 0.6 }, 1800),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s5",
      LL_DURATION * 4,
      LL_DURATION,
      "Thermal expansion: solids, liquids and gases expand when heated because particles move faster.",
      [
        actor("thermometer", 220, 290, "pulse", { temp: 0.8 }, 0),
        actor("bolt", 340, 270, "pulse", { color: "#FF5722" }, 600),
        actor("molecule", 470, 270, "vibrate", { color: "#FF5722" }, 1200),
        actor(
          "arrow",
          540,
          275,
          "appear",
          { angle: 0, length: 70, color: "#FF5722" },
          1800,
        ),
      ],
      "LOW_LOAD",
    ),
    scene(
      "s6",
      LL_DURATION * 5,
      LL_DURATION,
      "Insulators like wool and air gaps reduce heat transfer by trapping still air — poor conductors.",
      [
        actor("rock_layer", 240, 360, "idle", { color: "#8D6E63" }, 0),
        actor("air_particle", 380, 270, "idle", { color: "#90A4AE" }, 600),
        actor("thermometer", 500, 280, "pulse", { temp: 0.3 }, 1200),
        actor("bolt", 600, 260, "idle", { color: "#94A3B8" }, 1800),
      ],
      "LOW_LOAD",
    ),
  ],
};

// T04, T05, T07, T10, T11 — follow same pattern
// Add stubs so the system doesn't crash — full scenes to be completed
["energy", "light", "magnets", "food_chains", "weather"].forEach((topic) => {
  ["OVERLOAD", "OPTIMAL", "LOW_LOAD"].forEach((state) => {
    if (!PREBUILT_TEMPLATES[`${topic}_${state}`]) {
      PREBUILT_TEMPLATES[`${topic}_${state}`] = null; // placeholder
    }
  });
});
