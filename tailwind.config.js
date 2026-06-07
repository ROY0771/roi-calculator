/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mesda: {
          primary: '#A5CC31',
          dark: '#7BA51D',
          light: '#C4D860',
        }
      }
    },
  },
  plugins: [],
}
