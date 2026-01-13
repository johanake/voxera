/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f5ed',
          100: '#b3e0c9',
          200: '#80cca5',
          300: '#61ce70',
          400: '#4db85d',
          500: '#00733d',
          600: '#006637',
          700: '#005a31',
          800: '#004d2a',
          900: '#004023',
        },
      },
    },
  },
  plugins: [],
}
