/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f7f8fa",
          100: "#eceef2",
          200: "#d5dae3",
          300: "#b0b9c9",
          400: "#8593ab",
          500: "#667591",
          600: "#515f78",
          700: "#434d62",
          800: "#3a4253",
          900: "#1e2433",
        },
        accent: {
          DEFAULT: "#4f6cf6",
          dark: "#3d56c9",
        },
        surface: "#0f1419",
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(15, 20, 25, 0.12)",
      },
    },
  },
  plugins: [],
};
