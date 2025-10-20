// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A0A0A",    // Metallic Black
        accent: "#D4AF37",     // Metallic Gold
        background: "#1A1A1A", // Dark Gray
        card: "#2A2A2A",       // Slightly lighter gray
      },
    },
  },
} satisfies Config;
