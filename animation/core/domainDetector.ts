/**
 * core/domainDetector.ts — keyword → domain mapping.
 * Order of DOMAINS matters: first match wins; generic is fallback.
 */

import * as Electricity from "../domains/electricity";
import * as Generic from "../domains/generic";
import * as Gravity from "../domains/gravity";
import * as HumanBody from "../domains/humanBody";
import * as Photosynthesis from "../domains/photosynthesis";
import * as RockCycle from "../domains/rockCycle";
import * as SolarSystem from "../domains/solarSystem";
import * as WaterCycle from "../domains/waterCycle";
import * as BiodiversityAnimals from "../domains/biodiversity_animals";
import * as BiodiversityPlants from "../domains/biodiversity_plants";
import * as SensitivityResponse from "../domains/sensitivity_response";
import * as MovementLocomotion from "../domains/movement_locomotion";
import * as NutritionAutotrophic from "../domains/nutrition_autotrophic";

export type ConceptDomain =
  | "photosynthesis"
  | "water_cycle"
  | "gravity"
  | "electricity"
  | "rock_cycle"
  | "solar_system"
  | "human_body"
  | "biodiversity_animals"
  | "biodiversity_plants"
  | "sensitivity_response"
  | "movement_locomotion"
  | "nutrition_autotrophic"
  | "generic";

const DOMAINS: { key: ConceptDomain; keywords: string[] }[] = [
  { key: "photosynthesis", keywords: Photosynthesis.keywords },
  { key: "water_cycle", keywords: WaterCycle.keywords },
  { key: "gravity", keywords: Gravity.keywords },
  { key: "electricity", keywords: Electricity.keywords },
  { key: "rock_cycle", keywords: RockCycle.keywords },
  { key: "solar_system", keywords: SolarSystem.keywords },
  { key: "human_body", keywords: HumanBody.keywords },
  { key: "biodiversity_animals", keywords: BiodiversityAnimals.keywords },
  { key: "biodiversity_plants", keywords: BiodiversityPlants.keywords },
  { key: "sensitivity_response", keywords: SensitivityResponse.keywords },
  { key: "movement_locomotion", keywords: MovementLocomotion.keywords },
  { key: "nutrition_autotrophic", keywords: NutritionAutotrophic.keywords },
  { key: "generic", keywords: Generic.keywords },
];

// Plugin registry: maps domain key → its drawing module.
export const DOMAIN_PLUGINS: Record<
  ConceptDomain,
  {
    drawBackground: (ctx: any, W: number, H: number) => void;
    drawAnchorCharacters: (ctx: any, W: number, H: number, t: number) => void;
    keywordFallback: (
      ctx: any,
      sceneText: string,
      elapsed: number,
      t: number,
      W: number,
      H: number,
    ) => void;
  }
> = {
  photosynthesis: Photosynthesis,
  water_cycle: WaterCycle,
  gravity: Gravity,
  electricity: Electricity,
  rock_cycle: RockCycle,
  solar_system: SolarSystem,
  human_body: HumanBody,
  biodiversity_animals: BiodiversityAnimals,
  biodiversity_plants: BiodiversityPlants,
  sensitivity_response: SensitivityResponse,
  movement_locomotion: MovementLocomotion,
  nutrition_autotrophic: NutritionAutotrophic,
  generic: Generic,
};

export function detectDomain(title: string, scenes: any[]): ConceptDomain {
  const corpus = (
    title +
    " " +
    (scenes || []).map((s: any) => s.text || "").join(" ")
  ).toLowerCase();

  const found = DOMAINS.find(
    (d) =>
      d.key !== "generic" &&
      d.keywords.some((k) => corpus.includes(k.toLowerCase())),
  );
  return found ? found.key : "generic";
}
