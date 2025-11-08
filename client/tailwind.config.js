/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#132440",
          light: "#1a3254",
          dark: "#0d1a2d",
        },
        accent: {
          DEFAULT: "#16476A",
          light: "#1d5a87",
          dark: "#103651",
        },
        secondary: {
          DEFAULT: "#3B9797",
          light: "#4eb5b5",
          dark: "#2d7272",
        },
        danger: {
          DEFAULT: "#BF092F",
          light: "#d60a36",
          dark: "#9a0726",
        },
        highlight: {
          DEFAULT: "#770000",
          light: "#990000",
          dark: "#550000",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(19, 36, 64, 0.08)",
        "card-hover": "0 4px 16px rgba(19, 36, 64, 0.12)",
      },
    },
  },
  plugins: [],
};
