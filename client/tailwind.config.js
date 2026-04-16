/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0f172a", // Slate 900
          light: "#f8fafc",   // Slate 50
        },
        primary: {
          DEFAULT: "#6366f1", // Indigo 500
          hover: "#4f46e5",   // Indigo 600
        },
      },
    },
  },
  plugins: [],
}
