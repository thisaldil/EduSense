export const richScienceScript = {
  title: "Photosynthesis Flow",
  duration: 12000,
  scenes: [
    {
      id: "scene_1",
      startTime: 0,
      duration: 4000,
      text: "Sunlight reaches the leaf.",
      environment: "nature",
      actors: [
        { type: "sun", x: 640, y: 110, size: 90, animation: "glow" },
        { type: "plant", x: 260, y: 400, size: 120, animation: "sway" },
        { type: "arrow", x: 580, y: 160, angle: 2.5, length: 220, color: "#2563EB" },
      ],
    },
    {
      id: "scene_2",
      startTime: 4000,
      duration: 4000,
      text: "Water and carbon dioxide combine.",
      environment: "science",
      actors: [
        { type: "waterDrop", x: 250, y: 280, animation: "float" },
        { type: "molecule", x: 420, y: 280, moleculeType: "co2", animation: "drift" },
        { type: "label", x: 410, y: 120, text: "Reaction Zone", animation: "appear", color: "#0F172A" },
      ],
    },
    {
      id: "scene_3",
      startTime: 8000,
      duration: 4000,
      text: "Glucose is produced.",
      environment: "minimal",
      actors: [{ type: "glucose", x: 400, y: 280, size: 70, animation: "pulse" }],
    },
  ],
};

export const minimalAdaptiveScript = {
  title: "Energy",
  duration: 9000,
  scenes: [
    {
      id: "scene_1",
      startTime: 0,
      duration: 3000,
      text: "Green plants need light.",
      environment: "minimal",
      actors: [
        {
          type: "label",
          x: 400,
          y: 300,
          text: "Green plants need light.",
          color: "#000000",
          animation: "appear",
          timeline: [
            { at: 0, action: "appear", alpha: 0 },
            { at: 600, action: "appear", alpha: 1 },
          ],
        },
      ],
    },
    {
      id: "scene_2",
      startTime: 3000,
      duration: 3000,
      text: "Light makes energy.",
      environment: "minimal",
      actors: [{ type: "label", text: "Light makes energy.", x: 400, y: 300 }],
    },
    {
      id: "scene_3",
      startTime: 6000,
      duration: 3000,
      text: "Glucose is sugar.",
      environment: "minimal",
      actors: [{ type: "label", text: "Glucose is sugar.", x: 400, y: 300 }],
    },
  ],
};
