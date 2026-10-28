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
        canvas: "var(--canvas)",
        surface: {
          DEFAULT: "var(--surface-card)",
          hover: "var(--surface-hover)",
          sunken: "var(--surface-sunken)",
          border: "var(--surface-border)",
        },
        primary: {
          DEFAULT: "var(--brand-accent)",
          hover: "var(--brand-accent-hover)",
          active: "var(--brand-accent-active)",
          text: "var(--brand-accent-text)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          text: "var(--secondary-text)",
        },
        rating: "var(--star-accent)",
        success: "var(--success)",
        danger: "var(--danger)",
      },
    },
  },
  plugins: [],
};
export default config;
