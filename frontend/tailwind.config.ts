import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        night: {
          50:  "#F8F7F4",
          100: "#EEECEA",
          200: "#D5D2CC",
          300: "#B3AFA7",
          400: "#8A8580",
          500: "#6B6560",
          600: "#504B47",
          700: "#3A3530",
          800: "#1E1B18",
          900: "#0F0D0B",
          950: "#080604",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        "fade-up":      "fadeUp 0.6s ease forwards",
        "fade-in":      "fadeIn 0.4s ease forwards",
        "slide-right":  "slideRight 0.5s ease forwards",
        "scale-in":     "scaleIn 0.3s ease forwards",
        "shimmer":      "shimmer 2s infinite",
        "float":        "float 3s ease-in-out infinite",
        "glow":         "glow 2s ease-in-out infinite alternate",
        "spin-slow":    "spin 8s linear infinite",
        "border-spin":  "borderSpin 4s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideRight: {
          "0%":   { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(251, 191, 36, 0.7)" },
        },
        borderSpin: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backgroundImage: {
        "gold-gradient":   "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)",
        "dark-gradient":   "linear-gradient(180deg, #0F0D0B 0%, #1E1B18 100%)",
        "card-gradient":   "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "hero-gradient":   "linear-gradient(135deg, #0F0D0B 0%, #1E1B18 40%, #3A3530 100%)",
        "shimmer-gradient":"linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.1) 50%, transparent 100%)",
      },
      boxShadow: {
        "gold":     "0 0 30px rgba(251, 191, 36, 0.25)",
        "gold-lg":  "0 0 60px rgba(251, 191, 36, 0.35)",
        "card":     "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover":"0 8px 40px rgba(0, 0, 0, 0.6)",
        "inset-gold":"inset 0 1px 0 rgba(251, 191, 36, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
