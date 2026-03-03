/**
 * Advanced Test Animation Script for Gravity
 * Realistic and scientifically accurate representation of gravitational forces
 * Updated for smoother flow, simpler explanations, and enhanced realism
 * Use this to test the AnimationEngine without backend
 */
export const testGravityScript = {
    title: "Gravity: The Invisible Pull That Keeps Us Grounded",
    duration: 50000, // 50 seconds for comprehensive coverage
    scenes: [
        {
            id: "intro",
            startTime: 0,
            duration: 5000,
            text: "Gravity: The force that pulls everything with mass toward each other—like keeping you on Earth!",
            actors: [
                {
                    type: "earth",
                    x: 400,
                    y: 300,
                    size: 80,
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 400,
                    y: 200,
                    text: "Earth",
                    fontSize: 18,
                    color: "#2196F3"
                },
                {
                    type: "person",
                    x: 400,
                    y: 450,
                    size: 20,
                    animation: "fall-slow"
                },
                {
                    type: "label",
                    x: 400,
                    y: 480,
                    text: "You",
                    fontSize: 12,
                    color: "#FF9800"
                }
            ]
        },
        {
            id: "falling_objects",
            startTime: 5000,
            duration: 7000,
            text: "Step 1: Gravity makes all objects fall at the same speed toward Earth's center, no matter their weight",
            actors: [
                {
                    type: "earth",
                    x: 400,
                    y: 500,
                    size: 100,
                    animation: "idle"
                },
                {
                    type: "planet",
                    x: 200,
                    y: 100,
                    size: 20,
                    color: "#FF9800",
                    animation: "fall"
                },
                {
                    type: "planet",
                    x: 400,
                    y: 100,
                    size: 20,
                    color: "#9C27B0",
                    animation: "fall"
                },
                {
                    type: "planet",
                    x: 600,
                    y: 100,
                    size: 20,
                    color: "#E91E63",
                    animation: "fall"
                },
                {
                    type: "arrow",
                    x: 200,
                    y: 130,
                    length: 60,
                    angle: Math.PI / 2, // Down
                    color: "#FF5722",
                    animation: "flow"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 130,
                    length: 60,
                    angle: Math.PI / 2, // Down
                    color: "#FF5722",
                    animation: "flow"
                },
                {
                    type: "arrow",
                    x: 600,
                    y: 130,
                    length: 60,
                    angle: Math.PI / 2, // Down
                    color: "#FF5722",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 400,
                    y: 80,
                    text: "Pull of Gravity",
                    fontSize: 14,
                    color: "#FF5722"
                }
            ]
        },
        {
            id: "moon_orbit",
            startTime: 12000,
            duration: 10000,
            text: "Step 2: The Moon stays in orbit around Earth because gravity pulls it just right—not too hard, not too soft",
            actors: [
                {
                    type: "earth",
                    x: 400,
                    y: 300,
                    size: 70,
                    animation: "spin"
                },
                {
                    type: "moon",
                    x: 400,
                    y: 150,
                    size: 30,
                    animation: "orbit-smooth"
                },
                {
                    type: "line",
                    x1: 400,
                    y1: 300,
                    x2: 400,
                    y2: 150,
                    color: "#9E9E9E",
                    thickness: 2,
                    style: "dashed",
                    animation: "appear"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 200,
                    length: 80,
                    angle: -Math.PI / 2, // Toward Earth
                    color: "#2196F3",
                    animation: "pulse"
                },
                {
                    type: "label",
                    x: 500,
                    y: 220,
                    text: "Balanced Pull",
                    fontSize: 14,
                    color: "#2196F3"
                },
                {
                    type: "label",
                    x: 400,
                    y: 100,
                    text: "Moon's Orbit",
                    fontSize: 14,
                    color: "#757575"
                }
            ]
        },
        {
            id: "planetary_system",
            startTime: 22000,
            duration: 10000,
            text: "Step 3: Planets circle the Sun thanks to its huge gravity, like kids holding hands in a ring",
            actors: [
                {
                    type: "sun",
                    x: 400,
                    y: 300,
                    size: 60,
                    animation: "shine",
                    rays: true
                },
                {
                    type: "planet",
                    x: 250,
                    y: 300,
                    size: 25,
                    color: "#8BC34A",
                    animation: "orbit-smooth"
                },
                {
                    type: "planet",
                    x: 550,
                    y: 300,
                    size: 30,
                    color: "#4CAF50",
                    animation: "orbit-smooth"
                },
                {
                    type: "line",
                    x1: 400,
                    y1: 300,
                    x2: 250,
                    y2: 300,
                    color: "#9E9E9E",
                    thickness: 1,
                    style: "dashed",
                    animation: "appear"
                },
                {
                    type: "line",
                    x1: 400,
                    y1: 300,
                    x2: 550,
                    y2: 300,
                    color: "#9E9E9E",
                    thickness: 1,
                    style: "dashed",
                    animation: "appear"
                },
                {
                    type: "arrow",
                    x: 320,
                    y: 300,
                    length: 50,
                    angle: Math.PI, // Toward Sun
                    color: "#FFD700",
                    animation: "pulse"
                },
                {
                    type: "arrow",
                    x: 480,
                    y: 300,
                    length: 50,
                    angle: 0, // Toward Sun
                    color: "#FFD700",
                    animation: "pulse"
                },
                {
                    type: "label",
                    x: 400,
                    y: 200,
                    text: "Sun's Strong Pull",
                    fontSize: 16,
                    color: "#FFD700"
                }
            ]
        },
        {
            id: "gravity_strength",
            startTime: 32000,
            duration: 8000,
            text: "Step 4: Gravity gets stronger with more mass but weaker the farther apart things are (inverse square law)",
            actors: [
                {
                    type: "earth",
                    x: 200,
                    y: 300,
                    size: 60,
                    animation: "idle"
                },
                {
                    type: "planet",
                    x: 600,
                    y: 300,
                    size: 100,
                    color: "#9C27B0",
                    rings: true,
                    animation: "idle"
                },
                {
                    type: "planet",
                    x: 200,
                    y: 150,
                    size: 15,
                    color: "#FF9800",
                    animation: "fall-slow"
                },
                {
                    type: "planet",
                    x: 600,
                    y: 150,
                    size: 15,
                    color: "#FF9800",
                    animation: "fall-fast"
                },
                {
                    type: "arrow",
                    x: 200,
                    y: 180,
                    length: 30,
                    angle: Math.PI / 2, // Down
                    color: "#4CAF50",
                    animation: "flow"
                },
                {
                    type: "arrow",
                    x: 600,
                    y: 180,
                    length: 70,
                    angle: Math.PI / 2, // Down
                    color: "#9C27B0",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 200,
                    y: 130,
                    text: "Weak Pull (Small Mass)",
                    fontSize: 12,
                    color: "#4CAF50"
                },
                {
                    type: "label",
                    x: 600,
                    y: 130,
                    text: "Strong Pull (Big Mass)",
                    fontSize: 12,
                    color: "#9C27B0"
                },
                {
                    type: "label",
                    x: 200,
                    y: 380,
                    text: "Small Mass",
                    fontSize: 14,
                    color: "#2196F3"
                },
                {
                    type: "label",
                    x: 600,
                    y: 380,
                    text: "Large Mass",
                    fontSize: 14,
                    color: "#9C27B0"
                },
                {
                    type: "planet",
                    x: 400,
                    y: 450,
                    size: 20,
                    color: "#FF5722",
                    animation: "fall-slow"
                },
                {
                    type: "planet",
                    x: 400,
                    y: 200,
                    size: 20,
                    color: "#FF5722",
                    animation: "fall-fast"
                },
                {
                    type: "label",
                    x: 400,
                    y: 480,
                    text: "Close = Stronger",
                    fontSize: 10,
                    color: "#FF5722"
                },
                {
                    type: "label",
                    x: 400,
                    y: 170,
                    text: "Far = Weaker",
                    fontSize: 10,
                    color: "#FF5722"
                }
            ]
        },
        {
            id: "tidal_forces",
            startTime: 40000,
            duration: 10000,
            text: "Step 5: Gravity from the Moon stretches Earth's oceans, creating high and low tides every day",
            actors: [
                {
                    type: "earth",
                    x: 300,
                    y: 300,
                    size: 70,
                    animation: "spin",
                    showOceans: true
                },
                {
                    type: "moon",
                    x: 600,
                    y: 300,
                    size: 35,
                    animation: "orbit-slow"
                },
                {
                    type: "arrow",
                    x: 370,
                    y: 300,
                    length: 80,
                    angle: 0, // Right toward Moon
                    color: "#2196F3",
                    animation: "pulse"
                },
                {
                    type: "arrow",
                    x: 230,
                    y: 300,
                    length: 60,
                    angle: Math.PI, // Left (away from Moon)
                    color: "#2196F3",
                    animation: "pulse"
                },
                {
                    type: "label",
                    x: 450,
                    y: 280,
                    text: "High Tide (Bulge)",
                    fontSize: 14,
                    color: "#2196F3"
                },
                {
                    type: "label",
                    x: 150,
                    y: 280,
                    text: "High Tide (Bulge)",
                    fontSize: 14,
                    color: "#2196F3"
                },
                {
                    type: "label",
                    x: 300,
                    y: 240,
                    text: "Low Tide",
                    fontSize: 14,
                    color: "#757575"
                },
                {
                    type: "label",
                    x: 300,
                    y: 360,
                    text: "Low Tide",
                    fontSize: 14,
                    color: "#757575"
                },
                {
                    type: "line",
                    x1: 300,
                    y1: 300,
                    x2: 600,
                    y2: 300,
                    color: "#9E9E9E",
                    thickness: 2,
                    style: "dashed",
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 300,
                    y: 100,
                    text: "Newton's Law: F = G (m1 m2) / r²",
                    fontSize: 12,
                    color: "#FFD700"
                }
            ]
        }
    ]
};