import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: "#0f1117", card: "#1a1d27", hover: "#22252f" },
        border: { DEFAULT: "#2a2d3a" },
        accent: { DEFAULT: "#8b5cf6", light: "#a78bfa" },
      },
    },
  },
  plugins: [],
};

export default config;
