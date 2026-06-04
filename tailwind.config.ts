import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        astra: {
          navy: "#001c2a",
          ink: "#06111a",
          red: "#c81916",
          white: "#f8fbfd",
          steel: "#9fb5c4",
          turf: "#0f5a46",
          gold: "#f2c94c"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Black", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        crest: "0 28px 90px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
