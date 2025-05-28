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
          light: '#3B82F6', // blue-500
          DEFAULT: '#2563EB', // blue-600
          dark: '#1D4ED8', // blue-700
        },
        secondary: {
          light: '#10B981', // green-500
          DEFAULT: '#059669', // green-600
          dark: '#047857', // green-700
        },
        health: {
          light: '#D1FAE5', // green-100
          medium: '#6EE7B7', // green-300
          blue: '#EFF6FF', // blue-50
        }
      }
    },
  },
  plugins: [],
}