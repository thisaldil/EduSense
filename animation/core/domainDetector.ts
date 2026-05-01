/**
 * animation/core/domainDetector.ts
 * Lightweight domain detection for education animations.
 */

export type ConceptDomain =
  | "photosynthesis"
  | "water_cycle"
  | "food_chain"
  | "electric_circuit"
  | "sound"
  | "heat_transfer"
  | "gravity"
  | "solar_system"
  | "respiration"
  | "human_body"
  | "generic";

export type DomainVisualTheme = {
  backgroundTop: string;
  backgroundBottom: string;
  accent: string;
  ground?: string;
};

const DOMAIN_KEYWORDS: Record<ConceptDomain, string[]> = {
  photosynthesis: [
    "photosynthesis",
    "chlorophyll",
    "stomata",
    "sunlight",
    "glucose",
    "carbon dioxide",
    "co2",
    "oxygen",
    "leaf",
    "plant food",
  ],
  water_cycle: [
    "water cycle",
    "evaporation",
    "condensation",
    "precipitation",
    "collection",
    "rainfall",
    "cloud",
    "vapour",
    "vapor",
  ],
  food_chain: [
    "food chain",
    "food web",
    "producer",
    "consumer",
    "herbivore",
    "carnivore",
    "predator",
    "prey",
    "ecosystem",
  ],
  electric_circuit: [
    "electric circuit",
    "battery",
    "switch",
    "bulb",
    "wire",
    "current",
    "conductor",
    "insulator",
    "electricity",
  ],
  sound: [
    "sound",
    "vibration",
    "vibrate",
    "hearing",
    "ear",
    "noise",
    "echo",
    "wave",
    "frequency",
  ],
  heat_transfer: [
    "heat",
    "temperature",
    "thermal",
    "conduction",
    "convection",
    "radiation",
    "hot",
    "cold",
    "transfer",
  ],
  gravity: [
    "gravity",
    "weight",
    "fall",
    "drop",
    "pull",
    "attraction",
    "earth pulls",
  ],
  solar_system: [
    "solar system",
    "planet",
    "orbit",
    "sun",
    "moon",
    "asteroid",
    "galaxy",
    "earth",
  ],
  respiration: [
    "respiration",
    "breathing",
    "inhalation",
    "exhalation",
    "lungs",
    "oxygen",
    "carbon dioxide",
  ],
  human_body: [
    "heart",
    "blood",
    "circulation",
    "digestive",
    "muscle",
    "skeleton",
    "body system",
    "nervous",
  ],
  generic: [],
};

export const DOMAIN_VISUALS: Record<ConceptDomain, DomainVisualTheme> = {
  photosynthesis: {
    backgroundTop: "#A8E6A1",
    backgroundBottom: "#DFF7D8",
    accent: "#2E7D32",
    ground: "#795548",
  },
  water_cycle: {
    backgroundTop: "#9EDBFF",
    backgroundBottom: "#E2F5FF",
    accent: "#0288D1",
    ground: "#8D6E63",
  },
  food_chain: {
    backgroundTop: "#C9EFA5",
    backgroundBottom: "#F4FCE8",
    accent: "#558B2F",
    ground: "#7F5539",
  },
  electric_circuit: {
    backgroundTop: "#1E3A8A",
    backgroundBottom: "#111827",
    accent: "#FACC15",
  },
  sound: {
    backgroundTop: "#CFE8FF",
    backgroundBottom: "#EFF6FF",
    accent: "#2563EB",
  },
  heat_transfer: {
    backgroundTop: "#FFD6A5",
    backgroundBottom: "#FFEFD5",
    accent: "#EA580C",
  },
  gravity: {
    backgroundTop: "#BBDEFB",
    backgroundBottom: "#E3F2FD",
    accent: "#1D4ED8",
    ground: "#6D4C41",
  },
  solar_system: {
    backgroundTop: "#0F172A",
    backgroundBottom: "#1E1B4B",
    accent: "#60A5FA",
  },
  respiration: {
    backgroundTop: "#FFD9E8",
    backgroundBottom: "#FFF1F7",
    accent: "#E11D48",
  },
  human_body: {
    backgroundTop: "#FDE68A",
    backgroundBottom: "#FFF7CC",
    accent: "#DC2626",
  },
  generic: {
    backgroundTop: "#B5D9FF",
    backgroundBottom: "#ECF6FF",
    accent: "#2563EB",
    ground: "#7C5A45",
  },
};

function buildCorpus(title: string, scenes: any[]): string {
  const sceneText = Array.isArray(scenes)
    ? scenes
        .map((scene) => {
          const text = String(scene?.text || "");
          const actorTypes = Array.isArray(scene?.actors)
            ? scene.actors
                .map((actor: any) => String(actor?.type || ""))
                .join(" ")
            : "";
          return `${text} ${actorTypes}`;
        })
        .join(" ")
    : "";
  return `${title || ""} ${sceneText}`.toLowerCase();
}

export function detectDomain(title: string, scenes: any[]): ConceptDomain {
  const corpus = buildCorpus(title, scenes);
  if (!corpus.trim()) return "generic";

  let bestDomain: ConceptDomain = "generic";
  let bestScore = 0;

  (Object.keys(DOMAIN_KEYWORDS) as ConceptDomain[]).forEach((domain) => {
    if (domain === "generic") return;
    const words = DOMAIN_KEYWORDS[domain];
    let score = 0;
    for (const word of words) {
      if (corpus.includes(word)) score += 1;
    }
    if (score > bestScore) {
      bestDomain = domain;
      bestScore = score;
    }
  });

  return bestDomain;
}
