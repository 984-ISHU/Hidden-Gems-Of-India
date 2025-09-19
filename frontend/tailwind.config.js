/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          700: "#264653",
        },
        ivory: "#F4E1C1",
      },
    },
  },
  plugins: [],
};