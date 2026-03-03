/**
 * Advanced Test Animation Script for Electricity
 * Realistic and scientifically accurate representation of electrical circuits and flow
 * Updated for smoother flow, simpler explanations, and enhanced realism
 * Use this to test the AnimationEngine without backend
 */
export const testElectricityScript = {
    title: "Electricity: Powering Our World with Flowing Energy",
    duration: 45000, // 45 seconds for comprehensive coverage
    scenes: [
        {
            id: "intro",
            startTime: 0,
            duration: 5000,
            text: "Electricity: The flow of tiny charged particles called electrons that lights up our lives",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "appear"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "appear"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "appear"
                },
                {
                    type: "label",
                    x: 400,
                    y: 300,
                    text: "Battery",
                    fontSize: 16,
                    color: "#FF9800"
                },
                {
                    type: "label",
                    x: 650,
                    y: 300,
                    text: "Light Bulb",
                    fontSize: 16,
                    color: "#FFD700"
                }
            ]
        },
        {
            id: "electron_flow",
            startTime: 5000,
            duration: 6000,
            text: "Step 1: In a battery, chemical reactions push electrons through wires toward positive end",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "idle"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "idle"
                },
                {
                    type: "electron",
                    x: 420,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "electron",
                    x: 480,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "electron",
                    x: 540,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "arrow",
                    x: 500,
                    y: 370,
                    length: 200,
                    angle: 0,
                    color: "#2196F3",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 500,
                    y: 400,
                    text: "Electron Flow",
                    fontSize: 14,
                    color: "#2196F3"
                }
            ]
        },
        {
            id: "circuit_complete",
            startTime: 11000,
            duration: 6000,
            text: "Step 2: Complete Circuit - Wires connect battery to bulb, letting electrons flow in a loop",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "shine"
                },
                {
                    type: "wire",
                    x1: 650,
                    y1: 370,
                    x2: 400,
                    y2: 370,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "appear"
                },
                {
                    type: "electron",
                    x: 600,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "electron",
                    x: 420,
                    y: 370,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveLeft"
                },
                {
                    type: "arrow",
                    x: 500,
                    y: 390,
                    length: 200,
                    angle: Math.PI,
                    color: "#2196F3",
                    animation: "flow"
                },
                {
                    type: "label",
                    x: 500,
                    y: 420,
                    text: "Closed Loop",
                    fontSize: 14,
                    color: "#8B4513"
                }
            ]
        },
        {
            id: "resistance",
            startTime: 17000,
            duration: 7000,
            text: "Step 3: Resistance - Bulb resists electron flow, turning kinetic energy into light and heat",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "shine"
                },
                {
                    type: "wire",
                    x1: 650,
                    y1: 370,
                    x2: 400,
                    y2: 370,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "electron",
                    x: 620,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "vibrate"
                },
                {
                    type: "electron",
                    x: 630,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "vibrate"
                },
                {
                    type: "label",
                    x: 670,
                    y: 380,
                    text: "Resistance Here",
                    fontSize: 12,
                    color: "#FF5722"
                },
                {
                    type: "arrow",
                    x: 660,
                    y: 360,
                    length: 30,
                    angle: Math.PI / 2,
                    color: "#FF5722",
                    animation: "pulse"
                },
                {
                    type: "label",
                    x: 500,
                    y: 300,
                    text: "Electrons Slow Down",
                    fontSize: 14,
                    color: "#FF5722"
                }
            ]
        },
        {
            id: "voltage",
            startTime: 24000,
            duration: 6000,
            text: "Step 4: Voltage - Battery's 'push' (voltage) determines how hard electrons are driven through the circuit",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "shine"
                },
                {
                    type: "wire",
                    x1: 650,
                    y1: 370,
                    x2: 400,
                    y2: 370,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "number",
                    x: 420,
                    y: 320,
                    text: "9V",
                    size: 20,
                    color: "#FF9800",
                    animation: "rotate"
                },
                {
                    type: "arrow",
                    x: 400,
                    y: 330,
                    length: 100,
                    angle: 0,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "label",
                    x: 480,
                    y: 310,
                    text: "Voltage Push",
                    fontSize: 14,
                    color: "#FF9800"
                },
                {
                    type: "electron",
                    x: 550,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                }
            ]
        },
        {
            id: "current",
            startTime: 30000,
            duration: 7000,
            text: "Step 5: Current - Amount of electron flow (amperes) depends on voltage and resistance (Ohm's Law: I = V/R)",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "shine"
                },
                {
                    type: "wire",
                    x1: 650,
                    y1: 370,
                    x2: 400,
                    y2: 370,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "number",
                    x: 500,
                    y: 400,
                    text: "I = V/R",
                    size: 18,
                    color: "#2196F3",
                    animation: "pulse"
                },
                {
                    type: "electron",
                    x: 480,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "electron",
                    x: 520,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "electron",
                    x: 560,
                    y: 350,
                    size: 8,
                    color: "#2196F3",
                    animation: "moveRight"
                },
                {
                    type: "label",
                    x: 500,
                    y: 430,
                    text: "More Flow = Brighter Light",
                    fontSize: 12,
                    color: "#2196F3"
                }
            ]
        },
        {
            id: "applications",
            startTime: 37000,
            duration: 8000,
            text: "Step 6: Everyday Magic - Circuits power phones, cars, and homes, all from controlled electron flow!",
            actors: [
                {
                    type: "battery",
                    x: 400,
                    y: 350,
                    size: 60,
                    color: "#FF9800",
                    animation: "pulse"
                },
                {
                    type: "wire",
                    x1: 460,
                    y1: 350,
                    x2: 600,
                    y2: 350,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "bulb",
                    x: 650,
                    y: 350,
                    size: 40,
                    color: "#FFD700",
                    animation: "shine"
                },
                {
                    type: "wire",
                    x1: 650,
                    y1: 370,
                    x2: 400,
                    y2: 370,
                    thickness: 8,
                    color: "#8B4513",
                    animation: "glow"
                },
                {
                    type: "phone",
                    x: 200,
                    y: 200,
                    size: 30,
                    color: "#4CAF50",
                    animation: "glow"
                },
                {
                    type: "car",
                    x: 600,
                    y: 500,
                    size: 50,
                    color: "#9C27B0",
                    animation: "moveRight"
                },
                {
                    type: "label",
                    x: 200,
                    y: 240,
                    text: "Phones",
                    fontSize: 12,
                    color: "#4CAF50"
                },
                {
                    type: "label",
                    x: 600,
                    y: 540,
                    text: "Cars & Homes",
                    fontSize: 12,
                    color: "#9C27B0"
                },
                {
                    type: "label",
                    x: 400,
                    y: 280,
                    text: "Electrons Everywhere!",
                    fontSize: 16,
                    color: "#FFD700"
                }
            ]
        }
    ]
};