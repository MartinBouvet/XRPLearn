/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "../../packages/ui/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
      },
      colors: {
        primary: "#8b53fe", // Keeping brand purple
        secondary: "#02bd65", // Keeping brand green
        accent: "#5080bc", // Keeping brand blue

        // Organic Palette
        surface: {
          light: "#FDFBF7", // Off-white / Cream
          dark: "#0A0A0B", // Off-black / Charcoal
          glass: "rgba(255, 255, 255, 0.7)",
          glassDark: "rgba(10, 10, 11, 0.7)",
        },
        content: {
          primary: "#1A1A1C",
          secondary: "#5E5E62",
          light: "#E1E1E3",
          muted: "#A1A1AA",
        }
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)" },
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [],
};
