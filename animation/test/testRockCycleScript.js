/**
 * Advanced Test Animation Script for The Rock Cycle
 * Realistic and scientifically accurate representation of rock formation and transformation
 * Updated for smoother flow, simpler explanations, and enhanced realism
 * Use this to test the AnimationEngine without backend
 */
export const testRockCycleScript = {
    title: "The Rock Cycle: Rocks Changing Forms Over Time",
    duration: 45000, // 45 seconds for comprehensive coverage
    scenes: [
        {
            id: "intro",
            startTime: 0,
            duration: 5000,
            text: "The Rock Cycle: Rocks melt, erode, and reform in an endless loop shaping Earth's surface",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "appear"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "appear"
                },
                {
                    type: "ocean",
                    x: 200,
                    y: 450,
                    size: 150,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "label",
                    x: 400,
                    y: 200,
                    text: "Mountains",
                    fontSize: 16,
                    color: "#795548"
                },
                {
                    type: "label",
                    x: 600,
                    y: 300,
                    text: "Volcano",
                    fontSize: 16,
                    color: "#FF5722"
                }
            ]
        },
        {
            id: "igneous_formation",
            startTime: 5000,
            duration: 6000,
            text: "Step 1: Igneous Rocks - Magma from deep Earth cools to form solid rocks like granite",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "idle"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "erupt"
                },
                {
                    type: "molecule",
                    x: 650,
                    y: 300,
                    moleculeType: "magma",
                    size: 25,
                    color: "#FF9800",
                    animation: "flow"
                },
                {
                    type: "molecule",
                    x: 620,
                    y: 320,
                    moleculeType: "magma",
                    size: 25,
                    color: "#FF9800",
                    animation: "flow"
                },
                {
                    type: "arrow",
                    x: 650,
                    y: 380,
                    length: 100,
                    angle: Math.PI / 2,
                    color: "#FF9800",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 680,
                    y: 450,
                    text: "Cooling Magma",
                    fontSize: 14,
                    color: "#FF9800"
                },
                {
                    type: "rock",
                    x: 400,
                    y: 300,
                    size: 30,
                    color: "#8D6E63",
                    animation: "appear"
                }
            ]
        },
        {
            id: "weathering_erosion",
            startTime: 11000,
            duration: 6000,
            text: "Step 2: Weathering & Erosion - Wind, water, and ice break rocks into sediments like sand and gravel",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "erode"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "idle"
                },
                {
                    type: "ocean",
                    x: 200,
                    y: 450,
                    size: 150,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "cloud",
                    x: 300,
                    y: 100,
                    size: 40,
                    animation: "rain"
                },
                {
                    type: "molecule",
                    x: 450,
                    y: 280,
                    moleculeType: "sediment",
                    size: 20,
                    color: "#9E9E9E",
                    animation: "fall"
                },
                {
                    type: "molecule",
                    x: 380,
                    y: 300,
                    moleculeType: "sediment",
                    size: 20,
                    color: "#9E9E9E",
                    animation: "fall"
                },
                {
                    type: "arrow",
                    x: 420,
                    y: 320,
                    length: 150,
                    angle: 0.8, // Diagonal down-right
                    color: "#9E9E9E",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 500,
                    y: 380,
                    text: "Sediments",
                    fontSize: 14,
                    color: "#9E9E9E"
                }
            ]
        },
        {
            id: "sedimentary_formation",
            startTime: 17000,
            duration: 7000,
            text: "Step 3: Sedimentary Rocks - Sediments pile up in layers, get buried, and harden under pressure into sandstone",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "idle"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "idle"
                },
                {
                    type: "ocean",
                    x: 200,
                    y: 450,
                    size: 150,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "cloud",
                    x: 300,
                    y: 100,
                    size: 40,
                    animation: "idle"
                },
                {
                    type: "molecule",
                    x: 250,
                    y: 420,
                    moleculeType: "sediment",
                    size: 25,
                    color: "#9E9E9E",
                    animation: "pile"
                },
                {
                    type: "molecule",
                    x: 220,
                    y: 440,
                    moleculeType: "sediment",
                    size: 25,
                    color: "#9E9E9E",
                    animation: "pile"
                },
                {
                    type: "arrow",
                    x: 250,
                    y: 400,
                    length: 80,
                    angle: Math.PI / 2,
                    color: "#757575",
                    animation: "pulse"
                },
                {
                    type: "label",
                    x: 280,
                    y: 480,
                    text: "Layering & Pressure",
                    fontSize: 14,
                    color: "#757575"
                },
                {
                    type: "rock",
                    x: 250,
                    y: 450,
                    size: 35,
                    color: "#C0C0C0",
                    animation: "appear"
                }
            ]
        },
        {
            id: "metamorphic_formation",
            startTime: 24000,
            duration: 6000,
            text: "Step 4: Metamorphic Rocks - Heat and pressure change existing rocks into new forms like marble from limestone",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "pulse"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "idle"
                },
                {
                    type: "ocean",
                    x: 200,
                    y: 450,
                    size: 150,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "rock",
                    x: 450,
                    y: 280,
                    size: 30,
                    color: "#8D6E63",
                    animation: "rotate"
                },
                {
                    type: "number",
                    x: 450,
                    y: 320,
                    text: "Heat + Pressure",
                    size: 16,
                    color: "#FF5722",
                    animation: "glow"
                },
                {
                    type: "arrow",
                    x: 450,
                    y: 310,
                    length: 50,
                    angle: 0,
                    color: "#FF5722",
                    animation: "pulse"
                },
                {
                    type: "rock",
                    x: 500,
                    y: 280,
                    size: 30,
                    color: "#D7CCC8",
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 500,
                    y: 250,
                    text: "Marble",
                    fontSize: 12,
                    color: "#D7CCC8"
                }
            ]
        },
        {
            id: "melting",
            startTime: 30000,
            duration: 7000,
            text: "Step 5: Melting - Deep heat melts rocks back into magma, restarting the cycle",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "idle"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "pulse"
                },
                {
                    type: "ocean",
                    x: 200,
                    y: 450,
                    size: 150,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "rock",
                    x: 550,
                    y: 380,
                    size: 25,
                    color: "#8D6E63",
                    animation: "melt"
                },
                {
                    type: "molecule",
                    x: 550,
                    y: 420,
                    moleculeType: "magma",
                    size: 30,
                    color: "#FF9800",
                    animation: "bubbleUp"
                },
                {
                    type: "arrow",
                    x: 550,
                    y: 400,
                    length: 100,
                    angle: -Math.PI / 2,
                    color: "#FF5722",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 580,
                    y: 460,
                    text: "Back to Magma",
                    fontSize: 14,
                    color: "#FF9800"
                },
                {
                    type: "label",
                    x: 400,
                    y: 500,
                    text: "Cycle Repeats!",
                    fontSize: 16,
                    color: "#FFD700"
                }
            ]
        },
        {
            id: "summary",
            startTime: 37000,
            duration: 8000,
            text: "Igneous, sedimentary, metamorphic—rocks transform forever, building mountains and carving canyons",
            actors: [
                {
                    type: "mountain",
                    x: 400,
                    y: 250,
                    size: 120,
                    color: "#795548",
                    animation: "grow"
                },
                {
                    type: "volcano",
                    x: 600,
                    y: 350,
                    size: 80,
                    color: "#FF5722",
                    animation: "erupt"
                },
                {
                    type: "ocean",
                    x: 200,
                    y: 450,
                    size: 150,
                    color: "#2196F3",
                    animation: "wave"
                },
                {
                    type: "cloud",
                    x: 300,
                    y: 100,
                    size: 40,
                    animation: "sway"
                },
                {
                    type: "rock",
                    x: 300,
                    y: 350,
                    size: 25,
                    color: "#8D6E63",
                    animation: "rotate"
                },
                {
                    type: "rock",
                    x: 500,
                    y: 400,
                    size: 25,
                    color: "#C0C0C0",
                    animation: "rotate"
                },
                {
                    type: "rock",
                    x: 450,
                    y: 300,
                    size: 25,
                    color: "#D7CCC8",
                    animation: "rotate"
                },
                {
                    type: "arrow",
                    x: 200,
                    y: 300,
                    length: 400,
                    angle: 0,
                    color: "#FFD700",
                    animation: "rotate",
                    thickness: 3
                },
                {
                    type: "label",
                    x: 400,
                    y: 520,
                    text: "Endless Transformation",
                    fontSize: 16,
                    color: "#FFD700"
                }
            ]
        }
    ]
};