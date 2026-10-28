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
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
          border: "var(--border)",
        },
        border: "var(--border)",
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
          on: "var(--on-primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
          text: "var(--accent-text)",
        },
        rating: "var(--rating)",
        success: "var(--success)",
        danger: "var(--danger)",
        canvas: "var(--bg)",
      },
    },
  },
  plugins: [],
};
export default config;
