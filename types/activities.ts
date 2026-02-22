/**
 * Activity database types for Concept Playground.
 * Activities are suggested based on inferred cognitive load after completion.
 */

export type CognitiveLoad = "LOW" | "MEDIUM" | "HIGH";
export type ActivityType =
  | "TRUE_FALSE"
  | "MCQ"
  | "MATCHING"
  | "FILL_BLANK_WORD_BANK";
export type DifficultyLevel = "basic" | "intermediate" | "advanced";

/** TRUE_FALSE item */
export interface TrueFalseItem {
  id: number;
  statement: string;
  correct_answer: boolean;
  explanation: string;
}

/** MCQ item */
export interface McqItem {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  hint?: string;
  explanation?: string;
}

/** MATCHING pair */
export interface MatchingItem {
  id: number;
  left_item: string;
  right_item: string;
  pair_id: string;
}

/** FILL_BLANK item with word bank */
export interface FillBlankItem {
  id: number;
  sentence: string;
  correct_answer: string;
  hint?: string;
}

export interface ActivityFeedback {
  all_correct?: string;
  partial?: string;
  low_score?: string;
  correct_match?: string;
  incorrect_match?: string;
}

export interface BaseActivity {
  id?: string; // from API (e.g. MongoDB ObjectId)
  topic: string;
  cognitive_load: CognitiveLoad;
  activity_type: ActivityType;
  difficulty_level: DifficultyLevel;
  title: string;
  instructions: string;
  estimated_time: number;
  points: number;
  feedback?: ActivityFeedback;
  word_bank?: string[] | null; // API may send null for non–fill-blank activities
}

export interface TrueFalseActivity extends BaseActivity {
  activity_type: "TRUE_FALSE";
  items: TrueFalseItem[];
}

export interface McqActivity extends BaseActivity {
  activity_type: "MCQ";
  items: McqItem[];
}

export interface MatchingActivity extends BaseActivity {
  activity_type: "MATCHING";
  items: MatchingItem[];
}

export interface FillBlankActivity extends BaseActivity {
  activity_type: "FILL_BLANK_WORD_BANK";
  word_bank: string[];
  items: FillBlankItem[];
}

export type Activity =
  | TrueFalseActivity
  | McqActivity
  | MatchingActivity
  | FillBlankActivity;

/** Inferred from user's score on an activity (e.g. low score → high cognitive load). */
export function inferCognitiveLoadFromScore(scorePercent: number): CognitiveLoad {
  if (scorePercent >= 75) return "LOW";
  if (scorePercent >= 50) return "MEDIUM";
  return "HIGH";
}

/** Suggest activities that match (or are adjacent to) the given cognitive load. */
export function suggestActivitiesByCognitiveLoad(
  activities: Activity[],
  inferredLoad: CognitiveLoad,
  options?: { includeAdjacent?: boolean }
): Activity[] {
  const includeAdjacent = options?.includeAdjacent ?? true;
  const order: CognitiveLoad[] = ["LOW", "MEDIUM", "HIGH"];
  const idx = order.indexOf(inferredLoad);
  const loadsToInclude =
    includeAdjacent && idx >= 0
      ? [
          order[Math.max(0, idx - 1)],
          order[idx],
          order[Math.min(order.length - 1, idx + 1)],
        ]
      : [inferredLoad];

  const set = new Set(loadsToInclude);
  return activities.filter((a) => set.has(a.cognitive_load));
}
