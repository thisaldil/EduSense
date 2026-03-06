/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "deep-blue": "#0052CC",
        teal: "#00BFA6",
        "bright-orange": "#FFA726",
        brand: {
          background: "#FAFBFC",
          surface: "#FFFFFF",
          "surface-secondary": "#F9FAFB",
          text: "#1A1A1A",
          "text-secondary": "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        heading: ["Poppins_600SemiBold"],
        "heading-bold": ["Poppins_700Bold"],
      },
    },
  },
  plugins: [],
};
