import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#800020",
          dark: "#5A0016",
          light: "#A0002A",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
        secondary: {
          DEFAULT: "#1E1E1E",
          light: "#2A2A2A",
        },
        accent: {
          DEFAULT: "#C9A24D",
          dark: "#B8923D",
          light: "#D9B25D",
        },
        success: "#2ECC71",
        error: "#E74C3C",
        background: {
          light: "#F7F7F7",
          dark: "#121212",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1E1E1E",
        },
        text: {
          light: "#1E1E1E",
          dark: "#F7F7F7",
        },
      },
      // إضافة الخطوط بشكل صحيح داخل extend
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lora"', 'serif'],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;