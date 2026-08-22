import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        oven: {
          teal: "#0B6E64",
          "teal-dark": "#063E38",
          "teal-deep": "#042B27",
          charcoal: "#1B1512",
          "charcoal-2": "#241C18",
          char: "#120D0B",
          flame: "#E8672C",
          "flame-light": "#F4A93F",
          crust: "#F2C879",
          cream: "#FBF4E6",
          parchment: "#F6EEDD",
          smoke: "#8A9A96",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grain": "url('/images/grain.svg')",
        "flame-gradient": "linear-gradient(135deg, #E8672C 0%, #F4A93F 100%)",
        "teal-gradient": "linear-gradient(180deg, #063E38 0%, #042B27 100%)",
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(4, 43, 39, 0.35)",
        "card-hover": "0 18px 40px -14px rgba(4, 43, 39, 0.5)",
        ember: "0 0 0 1px rgba(232, 103, 44, 0.25), 0 8px 24px -8px rgba(232, 103, 44, 0.45)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 3.2s ease-in-out infinite",
        rise: "rise 0.6s ease-out both",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
