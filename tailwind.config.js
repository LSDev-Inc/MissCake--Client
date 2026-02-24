/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f6",
          100: "#ffece8",
          200: "#ffd8ce",
          300: "#ffc2af",
          400: "#ff9f85",
          500: "#ff7c5a",
          600: "#ef5c3a",
          700: "#cc4325",
          800: "#a6361f",
          900: "#7a2818"
        }
      },
      boxShadow: {
        soft: "0 10px 25px rgba(122, 40, 24, 0.12)",
      }
    },
  },
  plugins: [],
};