import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#08080A",
        surface: {
          DEFAULT: "#121216",
          hover: "#1A1A22",
        },
        border: {
          subtle: "#1E1E26",
          default: "#272730",
        },
        amber: {
          accent: "#F59E0B",
          hover: "#D97706",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
      },
    },
  },
  plugins: [],
};
export default config;
