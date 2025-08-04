/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          25: '#fafafa',
        },
        red: {
          25: '#fef2f2',
        },
        blue: {
          25: '#f0f9ff',
        }
      },
    },
  },
  plugins: [],
} 