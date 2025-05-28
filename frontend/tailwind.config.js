/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // blue-500
        secondary: '#10B981',  // green-500
      }
    },
  },
  plugins: [],
}