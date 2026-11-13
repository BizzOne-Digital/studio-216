import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "1.5rem", xl: "2.5rem" }, screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        ink: "#090909",
        charcoal: "#141414",
        graphite: "#242424",
        silver: { DEFAULT: "#C0C0C0", light: "#E7E7E7" },
        muted: "#999999",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        brush: ["var(--font-brush)", "cursive"],
      },
      backgroundImage: {
        metal: "linear-gradient(180deg,#ffffff 0%,#e7e7e7 35%,#9a9a9a 55%,#f2f2f2 75%,#b5b5b5 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
