/**
 * Advanced Test Animation Script for Photosynthesis
 * Realistic and scientifically accurate representation of the photosynthesis process
 * Updated for smoother flow, simpler explanations, and enhanced realism
 * Use this to test the AnimationEngine without backend
 */
export const testPhotosynthesisScript = {
    title: "Photosynthesis: Turning Sunlight into Plant Food",
    duration: 45000, // 45 seconds for comprehensive coverage
    scenes: [
        {
            id: "intro",
            startTime: 0,
            duration: 5000,
            text: "Photosynthesis: Plants use sunlight, water, and air to make their own food and release oxygen we breathe",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "grow"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "appear",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "appear"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "appear"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "appear"
                }
            ]
        },
        {
            id: "sunlight",
            startTime: 5000,
            duration: 6000,
            text: "Step 1: Sunlight hits the leaves, giving plants the energy they need to start making food",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "idle",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "sway"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "arrow",
                    x: 650,
                    y: 120,
                    length: 220,
                    angle: -0.27, // ~-15.5 degrees
                    color: "#FFD700",
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 550,
                    y: 140,
                    text: "Sunlight Energy",
                    fontSize: 14,
                    color: "#FFD700"
                }
            ]
        },
        {
            id: "water_absorption",
            startTime: 11000,
            duration: 6000,
            text: "Step 2: Roots pull water from the soil and send it up through the plant to the leaves",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "absorb"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "pulse",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "idle"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "idle"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "idle"
                },
                {
                    type: "molecule",
                    x: 300,
                    y: 580,
                    moleculeType: "water",
                    size: 30,
                    animation: "appear"
                },
                {
                    type: "molecule",
                    x: 400,
                    y: 580,
                    moleculeType: "water",
                    size: 30,
                    animation: "appear"
                },
                {
                    type: "molecule",
                    x: 500,
                    y: 580,
                    moleculeType: "water",
                    size: 30,
                    animation: "appear"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 520,
                    length: 120,
                    angle: -Math.PI / 2, // Straight up
                    color: "#2196F3",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 420,
                    y: 460,
                    text: "Water (H₂O)",
                    fontSize: 16,
                    color: "#2196F3"
                },
                {
                    type: "molecule",
                    x: 380,
                    y: 420,
                    moleculeType: "water",
                    size: 20,
                    animation: "move-up"
                }
            ]
        },
        {
            id: "co2_intake",
            startTime: 17000,
            duration: 6000,
            text: "Step 3: Carbon dioxide (CO₂) from the air enters the leaves through tiny holes called stomata",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "idle",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "sway"
                },
                {
                    type: "molecule",
                    x: 150,
                    y: 180,
                    moleculeType: "co2",
                    size: 35,
                    animation: "vibrate"
                },
                {
                    type: "molecule",
                    x: 200,
                    y: 160,
                    moleculeType: "co2",
                    size: 35,
                    animation: "vibrate"
                },
                {
                    type: "molecule",
                    x: 250,
                    y: 170,
                    moleculeType: "co2",
                    size: 35,
                    animation: "vibrate"
                },
                {
                    type: "arrow",
                    x: 280,
                    y: 175,
                    length: 85,
                    angle: 0.29, // ~16.6 degrees
                    color: "#757575",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 320,
                    y: 185,
                    text: "CO₂ from Air",
                    fontSize: 16,
                    color: "#757575"
                },
                {
                    type: "stomata",
                    x: 340,
                    y: 210,
                    size: 10,
                    animation: "open"
                }
            ]
        },
        {
            id: "chloroplast_reaction",
            startTime: 23000,
            duration: 7000,
            text: "Step 4: Inside green chloroplasts, sunlight splits water to make energy packets (ATP & NADPH) and free oxygen",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "idle",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "idle"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "idle"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "idle"
                },
                {
                    type: "cell",
                    x: 400,
                    y: 200,
                    size: 80,
                    cellType: "plant",
                    showLabels: true,
                    animation: "pulse"
                },
                {
                    type: "sun",
                    x: 700,
                    y: 80,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "chlorophyll",
                    x: 400,
                    y: 200,
                    size: 15,
                    color: "#00FF00",
                    animation: "absorb-light"
                },
                {
                    type: "molecule",
                    x: 360,
                    y: 220,
                    moleculeType: "water",
                    size: 25,
                    animation: "split"
                },
                {
                    type: "molecule",
                    x: 380,
                    y: 180,
                    moleculeType: "o2",
                    size: 20,
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 400,
                    y: 140,
                    text: "Chloroplast",
                    fontSize: 14,
                    color: "#2E7D32"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 240,
                    length: 110,
                    angle: 0.36, // ~20.6 degrees
                    color: "#FF9800",
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 480,
                    y: 270,
                    text: "ATP + NADPH",
                    fontSize: 12,
                    color: "#FF9800"
                },
                {
                    type: "arrow",
                    x: 420,
                    y: 190,
                    length: 60,
                    angle: -0.5, // Up and left
                    color: "#4CAF50",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 440,
                    y: 160,
                    text: "O₂ Starts Here",
                    fontSize: 10,
                    color: "#4CAF50"
                }
            ]
        },
        {
            id: "calvin_cycle",
            startTime: 30000,
            duration: 7000,
            text: "Step 5: The Calvin Cycle mixes CO₂ with the energy packets to build sugar (glucose) for the plant's food",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "idle",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "idle"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "idle"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "idle"
                },
                {
                    type: "cell",
                    x: 400,
                    y: 200,
                    size: 80,
                    cellType: "plant",
                    showLabels: true,
                    animation: "pulse"
                },
                {
                    type: "molecule",
                    x: 350,
                    y: 250,
                    moleculeType: "co2",
                    size: 30,
                    animation: "vibrate"
                },
                {
                    type: "molecule",
                    x: 300,
                    y: 240,
                    moleculeType: "atp",
                    size: 15,
                    animation: "rotate"
                },
                {
                    type: "molecule",
                    x: 320,
                    y: 260,
                    moleculeType: "nadph",
                    size: 15,
                    animation: "rotate"
                },
                {
                    type: "glucose",
                    x: 450,
                    y: 250,
                    animation: "build"
                },
                {
                    type: "arrow",
                    x: 380,
                    y: 250,
                    length: 50,
                    angle: 0, // Horizontal right
                    color: "#4CAF50",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 400,
                    y: 230,
                    text: "Calvin Cycle",
                    fontSize: 14,
                    color: "#2E7D32"
                },
                {
                    type: "label",
                    x: 450,
                    y: 280,
                    text: "Sugar (C₆H₁₂O₆)",
                    fontSize: 14,
                    color: "#FF9800"
                }
            ]
        },
        {
            id: "oxygen_release",
            startTime: 37000,
            duration: 8000,
            text: "Step 6: Leftover oxygen bubbles out of the leaves into the air—thank plants for fresh air!",
            actors: [
                {
                    type: "root",
                    x: 400,
                    y: 550,
                    depth: 80,
                    width: 100,
                    branches: 6,
                    color: "#8B4513",
                    animation: "idle"
                },
                {
                    type: "plant",
                    x: 400,
                    y: 350,
                    animation: "grow",
                    color: "#2E7D32"
                },
                {
                    type: "leaf",
                    x: 320,
                    y: 200,
                    size: 35,
                    angle: -0.3,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "leaf",
                    x: 480,
                    y: 200,
                    size: 35,
                    angle: 0.3,
                    color: "#4CAF50",
                    animation: "sway"
                },
                {
                    type: "leaf",
                    x: 400,
                    y: 150,
                    size: 40,
                    angle: 0,
                    color: "#66BB6A",
                    animation: "sway"
                },
                {
                    type: "molecule",
                    x: 320,
                    y: 180,
                    moleculeType: "o2",
                    size: 30,
                    animation: "bubble"
                },
                {
                    type: "molecule",
                    x: 400,
                    y: 160,
                    moleculeType: "o2",
                    size: 30,
                    animation: "bubble"
                },
                {
                    type: "molecule",
                    x: 480,
                    y: 180,
                    moleculeType: "o2",
                    size: 30,
                    animation: "bubble"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 190,
                    length: 90,
                    angle: -Math.PI / 2, // Straight up
                    color: "#4CAF50",
                    animation: "flow"
                },
                {
                    type: "arrow",
                    x: 320,
                    y: 210,
                    length: 95,
                    angle: -0.73, // ~-42 degrees
                    color: "#4CAF50",
                    animation: "flow"
                },
                {
                    type: "arrow",
                    x: 480,
                    y: 210,
                    length: 95,
                    angle: -2.41, // ~-138 degrees (up and left)
                    color: "#4CAF50",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 400,
                    y: 140,
                    text: "Oxygen (O₂) Released",
                    fontSize: 14,
                    color: "#4CAF50"
                },
                {
                    type: "molecule",
                    x: 280,
                    y: 100,
                    moleculeType: "o2",
                    size: 25,
                    animation: "vibrate"
                },
                {
                    type: "molecule",
                    x: 400,
                    y: 80,
                    moleculeType: "o2",
                    size: 25,
                    animation: "vibrate"
                },
                {
                    type: "molecule",
                    x: 520,
                    y: 100,
                    moleculeType: "o2",
                    size: 25,
                    animation: "vibrate"
                },
                {
                    type: "label",
                    x: 200,
                    y: 50,
                    text: "Overall: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂",
                    fontSize: 12,
                    color: "#FFD700"
                }
            ]
        }
    ]
};