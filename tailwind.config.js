/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        apple: {
          gray: '#F5F5F7',
          blue: '#007AFF',
          hoverBlue: '#0062CC',
          border: '#D2D2D7',
          text: '#1D1D1F',
          subtext: '#86868B'
        }
      }
    },
  },
  plugins: [],
}