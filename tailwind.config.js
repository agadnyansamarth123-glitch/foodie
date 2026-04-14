/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2fbf4",
          100: "#dff7e5",
          500: "#3fae5f",
          600: "#359651",
          700: "#2b7a42",
        },
      },
    },
  },
  plugins: [],
};
