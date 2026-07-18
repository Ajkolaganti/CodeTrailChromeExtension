/** @type {import('tailwindcss').Config} */
export default {
  content: ["./popup.html", "./options.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        trail: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          900: "#14532d"
        },
        ink: {
          50: "#f6f8fa",
          100: "#eaeef2",
          200: "#d0d7de",
          500: "#57606a",
          700: "#24292f",
          800: "#161b22",
          900: "#0d1117"
        },
        cobalt: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#2f81f7",
          600: "#1f6feb",
          700: "#1158c7"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(27, 31, 36, 0.1)",
        elevated: "0 18px 50px rgba(13, 17, 23, 0.18)"
      }
    }
  },
  plugins: []
};
