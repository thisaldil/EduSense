/**
 * Automatic Scientific Animation Script Generator
 *
 * Converts high-level AI concepts into engine-ready animation scripts
 *
 * Workflow:
 * 1. AI generates conceptual scene plan (semantic)
 * 2. Engine Mapping Layer converts to full script (automated)
 * 3. Output is ready for AnimationEngine
 */

// ============================================
// STEP 0: Define Engine Capabilities
// ============================================

export const ENGINE_CAPABILITIES = {
  actors: [
    "leaf",
    "root",
    "plant",
    "cell",
    "molecule",
    "sun",
    "glucose",
    "arrow",
    "label",
    "line",
    "planet",
    "earth",
    "moon",
    "star",
    "atom",
    "electron",
    "proton",
    "neutron",
    "animal",
    "bacteria",
  ],
  animations: [
    "idle",
    "appear",
    "pulse",
    "sway",
    "rotate",
    "vibrate",
    "shine",
    "grow",
    "absorb",
    "orbit",
    "spin",
    "fall",
    "glow",
  ],
  moleculeTypes: ["water", "co2", "o2", "dna"],
  defaultDurations: {
    short: 4000,
    medium: 6000,
    long: 8000,
    veryLong: 10000,
  },
};

// ============================================
// STEP 1: High-Level Concept Structure
// ============================================

/**
 * Example high-level concept from AI:
 * {
 *   "title": "Photosynthesis",
 *   "scenes": [
 *     {
 *       "id": "sunlight",
 *       "text": "Sunlight energizes the leaves",
 *       "actors": ["sun", "leaf"],
 *       "actions": ["shine", "sway"],
 *       "duration": "medium"
 *     }
 *   ]
 * }
 */

// ============================================
// STEP 2: Engine Mapping Layer
// ============================================

/**
 * Actor Mapping: Convert semantic actor names to engine actor configs
 */
const ACTOR_MAPPINGS = {
  // Biology
  leaf: (config = {}) => ({
    type: "leaf",
    size: config.size || 35,
    color: config.color || "#4CAF50",
    angle: config.angle || 0,
    ...config,
  }),

  root: (config = {}) => ({
    type: "root",
    depth: config.depth || 80,
    width: config.width || 100,
    branches: config.branches || 6,
    color: config.color || "#8B4513",
    ...config,
  }),

  plant: (config = {}) => ({
    type: "plant",
    color: config.color || "#2E7D32",
    ...config,
  }),

  cell: (config = {}) => ({
    type: "cell",
    size: config.size || 80,
    cellType: config.cellType || "plant",
    showLabels: config.showLabels !== false,
    ...config,
  }),

  // Molecules
  "water molecule": (config = {}) => ({
    type: "molecule",
    moleculeType: "water",
    size: config.size || 30,
    ...config,
  }),

  "co2 molecule": (config = {}) => ({
    type: "molecule",
    moleculeType: "co2",
    size: config.size || 35,
    ...config,
  }),

  "o2 molecule": (config = {}) => ({
    type: "molecule",
    moleculeType: "o2",
    size: config.size || 30,
    ...config,
  }),

  molecule: (config = {}) => ({
    type: "molecule",
    moleculeType: config.moleculeType || "water",
    size: config.size || 30,
    ...config,
  }),

  // Astronomy
  sun: (config = {}) => ({
    type: "sun",
    size: config.size || 60,
    rays: config.rays !== false,
    ...config,
  }),

  earth: (config = {}) => ({
    type: "earth",
    size: config.size || 70,
    ...config,
  }),

  moon: (config = {}) => ({
    type: "moon",
    size: config.size || 30,
    ...config,
  }),

  planet: (config = {}) => ({
    type: "planet",
    size: config.size || 40,
    color: config.color || "#4A90E2",
    rings: config.rings || false,
    ...config,
  }),

  // Visual aids
  arrow: (config = {}) => ({
    type: "arrow",
    length: config.length || 100,
    angle: config.angle || 0,
    color: config.color || "#FF0000",
    thickness: config.thickness || 5,
    ...config,
  }),

  label: (config = {}) => ({
    type: "label",
    text: config.text || "Label",
    fontSize: config.fontSize || 14,
    color: config.color || "#000000",
    ...config,
  }),

  line: (config = {}) => ({
    type: "line",
    x1: config.x1 || config.x || 0,
    y1: config.y1 || config.y || 0,
    x2: config.x2 || config.x + 100,
    y2: config.y2 || config.y,
    color: config.color || "#000000",
    thickness: config.thickness || 2,
    style: config.style || "solid",
    ...config,
  }),

  glucose: (config = {}) => ({
    type: "glucose",
    ...config,
  }),
};

/**
 * Animation Mapping: Convert semantic actions to engine animations
 */
const ANIMATION_MAPPINGS = {
  shine: "shine",
  sway: "sway",
  appear: "appear",
  absorb: "absorb",
  grow: "grow",
  pulse: "pulse",
  rotate: "rotate",
  vibrate: "vibrate",
  orbit: "orbit",
  spin: "spin",
  idle: "idle",
  glow: "glow",
  fall: "fall",
};

/**
 * Position Generator: Smart positioning based on actor type and scene context
 */
class PositionGenerator {
  constructor(canvasWidth = 800, canvasHeight = 600) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.usedPositions = [];
  }

  /**
   * Get position for actor based on type and context
   */
  getPosition(actorType, context = {}) {
    let x, y;

    switch (actorType) {
      case "sun":
        x = this.canvasWidth - 100;
        y = 80;
        break;

      case "leaf":
        x = context.x || 400 + (Math.random() - 0.5) * 160;
        y = context.y || 150 + (Math.random() - 0.5) * 50;
        break;

      case "root":
        x = context.x || this.canvasWidth / 2;
        y = this.canvasHeight - 50;
        break;

      case "plant":
        x = context.x || this.canvasWidth / 2;
        y = context.y || this.canvasHeight / 2;
        break;

      case "molecule":
        // Position molecules near their source
        if (context.source) {
          x = context.source.x + (Math.random() - 0.5) * 100;
          y = context.source.y + (Math.random() - 0.5) * 100;
        } else {
          x = context.x || Math.random() * this.canvasWidth;
          y = context.y || Math.random() * this.canvasHeight;
        }
        break;

      case "earth":
      case "planet":
        x = context.x || this.canvasWidth / 2;
        y = context.y || this.canvasHeight / 2;
        break;

      case "moon":
        x = context.x || this.canvasWidth / 2;
        y = context.y || 150;
        break;

      default:
        x = context.x || this.canvasWidth / 2;
        y = context.y || this.canvasHeight / 2;
    }

    // Add slight randomization to avoid exact overlaps
    if (context.randomize !== false) {
      x += (Math.random() - 0.5) * 20;
      y += (Math.random() - 0.5) * 20;
    }

    return {
      x: Math.max(50, Math.min(this.canvasWidth - 50, x)),
      y: Math.max(50, Math.min(this.canvasHeight - 50, y)),
    };
  }

  /**
   * Calculate arrow position and angle between two points
   */
  getArrowConfig(from, to, offset = 0) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Start arrow slightly offset from source
    const startX = from.x + Math.cos(angle) * offset;
    const startY = from.y + Math.sin(angle) * offset;

    return {
      x: startX,
      y: startY,
      length: Math.max(50, length - offset * 2),
      angle: angle,
    };
  }
}

// ============================================
// STEP 3: Timing Assignment
// ============================================

/**
 * Convert relative durations to absolute startTime and duration
 */
function assignTiming(scenes, defaultDuration = 6000) {
  let startTime = 0;

  return scenes.map((scene) => {
    let duration;

    if (typeof scene.duration === "string") {
      duration =
        ENGINE_CAPABILITIES.defaultDurations[scene.duration] || defaultDuration;
    } else if (typeof scene.duration === "number") {
      duration = scene.duration;
    } else {
      duration = defaultDuration;
    }

    const sceneWithTiming = {
      ...scene,
      startTime,
      duration,
    };

    startTime += duration;
    return sceneWithTiming;
  });
}

// ============================================
// STEP 4: Molecule/Animation Placement
// ============================================

/**
 * Generate arrows and labels automatically based on actor relationships
 */
function generateVisualAids(actors, positionGen) {
  const aids = [];
  const molecules = actors.filter((a) => a.type === "molecule");
  const targets = actors.filter((a) =>
    ["root", "leaf", "cell", "plant"].includes(a.type),
  );

  // Generate arrows from molecules to targets
  molecules.forEach((molecule, idx) => {
    const target = targets[idx % targets.length];
    if (target && molecule.x && molecule.y && target.x && target.y) {
      const arrowConfig = positionGen.getArrowConfig(
        { x: molecule.x, y: molecule.y },
        { x: target.x, y: target.y },
        30,
      );

      aids.push({
        type: "arrow",
        ...arrowConfig,
        color: "#2196F3",
        animation: "appear",
      });
    }
  });

  return aids;
}

// ============================================
// STEP 5: Main Generator Function
// ============================================

/**
 * Generate engine-ready script from high-level concept
 *
 * @param {Object} concept - High-level concept from AI
 * @param {Object} options - Generation options
 * @returns {Object} Engine-ready animation script
 */
export function generateScript(concept, options = {}) {
  const {
    canvasWidth = 800,
    canvasHeight = 600,
    defaultDuration = 6000,
    autoGenerateArrows = true,
    autoGenerateLabels = true,
  } = options;

  const positionGen = new PositionGenerator(canvasWidth, canvasHeight);

  // Step 1: Assign timing
  const timedScenes = assignTiming(concept.scenes || [], defaultDuration);

  // Step 2: Map each scene
  const mappedScenes = timedScenes.map((scene, sceneIndex) => {
    const actors = [];
    const visualAids = [];
    const actorPositions = {};

    // Map actors from concept
    if (scene.actors && Array.isArray(scene.actors)) {
      scene.actors.forEach((actorSpec, idx) => {
        let actorConfig = {};
        let actorType = actorSpec;
        let animation = null;

        // Handle different actor spec formats
        if (typeof actorSpec === "string") {
          actorType = actorSpec;
        } else if (typeof actorSpec === "object") {
          actorType = actorSpec.type || actorSpec.name || actorSpec;
          actorConfig = { ...actorSpec };
          animation = actorSpec.animation || actorSpec.action;
        }

        // Get animation from scene actions if not specified
        if (!animation && scene.actions && scene.actions[idx]) {
          animation =
            ANIMATION_MAPPINGS[scene.actions[idx]] || scene.actions[idx];
        }

        // Get position
        const position = positionGen.getPosition(actorType, {
          ...actorConfig,
          sceneIndex,
          actorIndex: idx,
        });

        actorPositions[actorType + idx] = position;

        // Map actor
        const mapper = ACTOR_MAPPINGS[actorType.toLowerCase()];
        if (mapper) {
          const mappedActor = mapper({
            ...actorConfig,
            ...position,
            animation: animation || actorConfig.animation || "idle",
          });
          actors.push(mappedActor);
        } else {
          console.warn(`Unknown actor type: ${actorType}`);
        }
      });
    }

    // Auto-generate visual aids
    if (autoGenerateArrows || autoGenerateLabels) {
      const aids = generateVisualAids(actors, positionGen);
      visualAids.push(...aids);
    }

    // Add labels if specified
    if (autoGenerateLabels && scene.labels) {
      scene.labels.forEach((labelSpec) => {
        const label =
          typeof labelSpec === "string" ? { text: labelSpec } : labelSpec;

        visualAids.push({
          type: "label",
          ...label,
          fontSize: label.fontSize || 14,
          color: label.color || "#000000",
        });
      });
    }

    return {
      id: scene.id || `scene_${sceneIndex}`,
      startTime: scene.startTime,
      duration: scene.duration,
      text: scene.text || "",
      actors: [...actors, ...visualAids],
    };
  });

  // Calculate total duration
  const totalDuration = mappedScenes.reduce((max, scene) => {
    return Math.max(max, scene.startTime + scene.duration);
  }, 0);

  return {
    title: concept.title || "Generated Animation",
    duration: totalDuration,
    scenes: mappedScenes,
  };
}

// ============================================
// STEP 6: Example Usage
// ============================================

/**
 * Example: Generate script from high-level concept
 */
export function exampleUsage() {
  const concept = {
    title: "Photosynthesis: Automated",
    scenes: [
      {
        id: "intro",
        text: "Photosynthesis process begins",
        actors: ["plant", "root"],
        actions: ["appear", "grow"],
        duration: "short",
      },
      {
        id: "sunlight",
        text: "Sunlight provides energy",
        actors: [
          { type: "leaf", size: 40 },
          { type: "sun", size: 60 },
        ],
        actions: ["sway", "shine"],
        duration: "medium",
      },
      {
        id: "water",
        text: "Water is absorbed by roots",
        actors: [
          { type: "root" },
          { type: "molecule", moleculeType: "water", count: 3 },
        ],
        actions: ["absorb", "appear"],
        duration: "medium",
      },
    ],
  };

  return generateScript(concept, {
    autoGenerateArrows: true,
    autoGenerateLabels: true,
  });
}

// Export for use in other modules
export default {
  generateScript,
  ENGINE_CAPABILITIES,
  ACTOR_MAPPINGS,
  ANIMATION_MAPPINGS,
  PositionGenerator,
};
