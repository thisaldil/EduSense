/**
 * Advanced Test Animation Script for Water Cycle
 * Realistic and scientifically accurate representation of the water cycle process
 * Updated for smoother flow, simpler explanations, and enhanced realism
 * Use this to test the AnimationEngine without backend
 */
export const testWaterCycleScript = {
    title: "The Water Cycle: Earth's Endless Journey of Water",
    duration: 45000, // 45 seconds for comprehensive coverage
    scenes: [
        {
            id: "intro",
            startTime: 0,
            duration: 5000,
            text: "The Water Cycle: Water moves from oceans to sky and back again, giving us rain and rivers",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 400,
                    y: 500,
                    text: "Ocean",
                    fontSize: 16,
                    color: "#2196F3"
                },
                {
                    type: "label",
                    x: 400,
                    y: 100,
                    text: "Clouds",
                    fontSize: 16,
                    color: "#9E9E9E"
                }
            ]
        },
        {
            id: "evaporation",
            startTime: 5000,
            duration: 6000,
            text: "Step 1: Evaporation - Sun heats ocean water, turning it into water vapor that rises into the air",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    size: 50,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "molecule",
                    x: 350,
                    y: 450,
                    moleculeType: "water",
                    size: 20,
                    animation: "bubbleUp"
                },
                {
                    type: "molecule",
                    x: 400,
                    y: 450,
                    moleculeType: "water",
                    size: 20,
                    animation: "bubbleUp"
                },
                {
                    type: "molecule",
                    x: 450,
                    y: 450,
                    moleculeType: "water",
                    size: 20,
                    animation: "bubbleUp"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 350,
                    length: 150,
                    angle: -Math.PI / 2,
                    color: "#FF9800",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 420,
                    y: 300,
                    text: "Water Vapor",
                    fontSize: 14,
                    color: "#FF9800"
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "grow"
                }
            ]
        },
        {
            id: "condensation",
            startTime: 11000,
            duration: 6000,
            text: "Step 2: Condensation - Warm air rises and cools, water vapor turns back into tiny droplets forming clouds",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    size: 50,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "molecule",
                    x: 380,
                    y: 300,
                    moleculeType: "water",
                    size: 15,
                    animation: "vibrate"
                },
                {
                    type: "molecule",
                    x: 420,
                    y: 280,
                    moleculeType: "water",
                    size: 15,
                    animation: "vibrate"
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "pulse"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 250,
                    length: 80,
                    angle: -Math.PI / 2,
                    color: "#9E9E9E",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 420,
                    y: 200,
                    text: "Cooling Air",
                    fontSize: 14,
                    color: "#9E9E9E"
                }
            ]
        },
        {
            id: "precipitation",
            startTime: 17000,
            duration: 7000,
            text: "Step 3: Precipitation - Clouds get heavy, water droplets fall as rain, snow, or hail back to Earth",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    size: 50,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "sway"
                },
                {
                    type: "molecule",
                    x: 400,
                    y: 200,
                    moleculeType: "water",
                    size: 25,
                    animation: "fall"
                },
                {
                    type: "molecule",
                    x: 380,
                    y: 200,
                    moleculeType: "water",
                    size: 25,
                    animation: "fall"
                },
                {
                    type: "molecule",
                    x: 420,
                    y: 200,
                    moleculeType: "water",
                    size: 25,
                    animation: "fall"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 220,
                    length: 200,
                    angle: Math.PI / 2,
                    color: "#2196F3",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 420,
                    y: 420,
                    text: "Rain",
                    fontSize: 16,
                    color: "#2196F3"
                }
            ]
        },
        {
            id: "runoff",
            startTime: 24000,
            duration: 6000,
            text: "Step 4: Runoff - Rain flows into rivers and streams, heading back to the ocean or soaking into the ground",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    size: 50,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "idle"
                },
                {
                    type: "mountain",
                    x: 200,
                    y: 300,
                    size: 100,
                    color: "#795548",
                    animation: "idle"
                },
                {
                    type: "molecule",
                    x: 300,
                    y: 400,
                    moleculeType: "water",
                    size: 20,
                    animation: "moveDown"
                },
                {
                    type: "molecule",
                    x: 350,
                    y: 420,
                    moleculeType: "water",
                    size: 20,
                    animation: "moveDown"
                },
                {
                    type: "arrow",
                    x: 300,
                    y: 350,
                    length: 150,
                    angle: 0.5, // Diagonal right-down
                    color: "#2196F3",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 380,
                    y: 380,
                    text: "Runoff to Rivers",
                    fontSize: 14,
                    color: "#2196F3"
                }
            ]
        },
        {
            id: "infiltration",
            startTime: 30000,
            duration: 7000,
            text: "Step 5: Infiltration - Some water seeps into the soil, becoming groundwater that feeds plants and aquifers",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    size: 50,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "idle"
                },
                {
                    type: "mountain",
                    x: 200,
                    y: 300,
                    size: 100,
                    color: "#795548",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 500,
                    y: 350,
                    size: 40,
                    color: "#4CAF50",
                    animation: "grow"
                },
                {
                    type: "molecule",
                    x: 450,
                    y: 400,
                    moleculeType: "water",
                    size: 20,
                    animation: "absorb"
                },
                {
                    type: "arrow",
                    x: 450,
                    y: 380,
                    length: 80,
                    angle: Math.PI / 2,
                    color: "#8B4513",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 470,
                    y: 430,
                    text: "Groundwater",
                    fontSize: 14,
                    color: "#8B4513"
                },
                {
                    type: "label",
                    x: 520,
                    y: 320,
                    text: "To Plants",
                    fontSize: 12,
                    color: "#4CAF50"
                }
            ]
        },
        {
            id: "summary",
            startTime: 37000,
            duration: 8000,
            text: "The cycle repeats endlessly, powering weather and life on Earth—evaporation, condensation, precipitation, and more!",
            actors: [
                {
                    type: "ocean",
                    x: 400,
                    y: 450,
                    size: 200,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    size: 50,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "cloud",
                    x: 400,
                    y: 150,
                    size: 60,
                    animation: "sway"
                },
                {
                    type: "mountain",
                    x: 200,
                    y: 300,
                    size: 100,
                    color: "#795548",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 500,
                    y: 350,
                    size: 40,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "arrow",
                    x: 100,
                    y: 300,
                    length: 600,
                    angle: 0,
                    color: "#FFD700",
                    animation: "rotate",
                    thickness: 3
                },
                {
                    type: "label",
                    x: 400,
                    y: 520,
                    text: "The Endless Cycle Continues...",
                    fontSize: 16,
                    color: "#FFD700"
                }
            ]
        }
    ]
};