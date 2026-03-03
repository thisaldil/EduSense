/**
 * Complete Actor Registry
 * Central registry for all 25+ actor types
 */

import { Platform } from "react-native";

// Astronomy actors
import { Planet } from "./astronomy/Planet";
import { Earth } from "./astronomy/Earth";
import { Moon } from "./astronomy/Moon";
import { Star } from "./astronomy/Star";
import { Asteroid } from "./astronomy/Asteroid";
import { Comet } from "./astronomy/Comet";
import { Sun } from "./astronomy/Sun";

// Earth/Environment actors
import { Cloud } from "./earth/Cloud";
import { Mountain } from "./earth/Mountain";
import { Ocean } from "./earth/Ocean";
import { Volcano } from "./earth/Volcano";

// Biology actors
import { Animal } from "./biology/Animal";
import { Cell } from "./biology/Cell";
import { Bacteria } from "./biology/Bacteria";
import { Leaf } from "./biology/Leaf";
// Root actor uses canvas features not fully supported on native yet (shadows etc.)
// To avoid runtime errors on native, only require it on web.
let Root = null;
if (Platform.OS === "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Root = require("./biology/Root").Root;
}

// Chemistry/Physics actors
import { Molecule } from "./chemistry/Molecule";
import { Atom } from "./chemistry/Atom";
import { Electron } from "./chemistry/Electron";
import { Proton } from "./chemistry/Proton";
import { Neutron } from "./chemistry/Neutron";

// Visual aids
import { Arrow } from "./visual/Arrow";
import { Label } from "./visual/Label";
import { Line } from "./visual/Line";
import { Graph } from "./visual/Graph";
import { Number as NumberActor } from "./visual/Number";

/**
 * Actor Registry
 * Maps actor type names to their implementation classes
 */
export const actorRegistry = {
    // Astronomy (6 actors)
    planet: Planet,
    earth: Earth,
    moon: Moon,
    star: Star,
    asteroid: Asteroid,
    comet: Comet,
    sun: Sun,

    // Earth/Environment (4 actors)
    cloud: Cloud,
    mountain: Mountain,
    ocean: Ocean,
    volcano: Volcano,

    // Biology (5 actors)
    animal: Animal,
    cell: Cell,
    bacteria: Bacteria,
    leaf: Leaf,
    root: Root,

    // Chemistry/Physics (5 actors)
    molecule: Molecule,
    atom: Atom,
    electron: Electron,
    proton: Proton,
    neutron: Neutron,

    // Visual Aids (5 actors)
    arrow: Arrow,
    label: Label,
    line: Line,
    graph: Graph,
    number: NumberActor,
};

/**
 * Actor categories for organization
 */
export const actorCategories = {
    astronomy: ['planet', 'earth', 'moon', 'star', 'asteroid', 'comet'],
    earth: ['cloud', 'mountain', 'ocean', 'volcano'],
    biology: ['animal', 'cell', 'bacteria', 'leaf', 'root'],
    chemistry: ['molecule', 'atom', 'electron', 'proton', 'neutron'],
    visual: ['arrow', 'label', 'line', 'graph', 'number'],
};

/**
 * Register a new actor type
 * @param {string} type - Actor type name
 * @param {Object} actorClass - Actor class with static draw method
 * @param {string} category - Optional category
 */
export function registerActor(type, actorClass, category = 'custom') {
    if (!actorClass.draw || typeof actorClass.draw !== 'function') {
        throw new Error(`Actor class for type "${type}" must have a static draw method`);
    }
    actorRegistry[type] = actorClass;

    if (!actorCategories[category]) {
        actorCategories[category] = [];
    }
    if (!actorCategories[category].includes(type)) {
        actorCategories[category].push(type);
    }
}

/**
 * Get actor class by type
 * @param {string} type - Actor type name
 * @returns {Object|null} - Actor class or null if not found
 */
export function getActor(type) {
    return actorRegistry[type] || null;
}

/**
 * Get all registered actor types
 * @returns {string[]} - Array of actor type names
 */
export function getActorTypes() {
    return Object.keys(actorRegistry);
}

/**
 * Get actors by category
 * @param {string} category - Category name
 * @returns {string[]} - Array of actor type names in category
 */
export function getActorsByCategory(category) {
    return actorCategories[category] || [];
}

/**
 * Check if actor type is registered
 * @param {string} type - Actor type name
 * @returns {boolean}
 */
export function hasActor(type) {
    return type in actorRegistry;
}

/**
 * Get total number of registered actors
 * @returns {number}
 */
export function getActorCount() {
    return Object.keys(actorRegistry).length;
}