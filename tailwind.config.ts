import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        oven: {
          teal: "rgb(var(--oven-teal) / <alpha-value>)",
          "teal-dark": "rgb(var(--oven-teal-dark) / <alpha-value>)",
          "teal-deep": "rgb(var(--oven-teal-deep) / <alpha-value>)",
          charcoal: "rgb(var(--oven-charcoal) / <alpha-value>)",
          "charcoal-2": "rgb(var(--oven-charcoal-2) / <alpha-value>)",
          char: "rgb(var(--oven-char) / <alpha-value>)",
          flame: "rgb(var(--oven-flame) / <alpha-value>)",
          "flame-light": "rgb(var(--oven-flame-light) / <alpha-value>)",
          crust: "rgb(var(--oven-crust) / <alpha-value>)",
          cream: "rgb(var(--oven-cream) / <alpha-value>)",
          parchment: "rgb(var(--oven-parchment) / <alpha-value>)",
          smoke: "rgb(var(--oven-smoke) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grain": "url('/images/grain.svg')",
        "flame-gradient": "linear-gradient(135deg, rgb(var(--oven-flame)) 0%, rgb(var(--oven-flame-light)) 100%)",
        "teal-gradient": "linear-gradient(180deg, rgb(var(--oven-teal-dark)) 0%, rgb(var(--oven-teal-deep)) 100%)",
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
