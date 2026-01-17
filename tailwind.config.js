/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#10051e',
        },
        slate: {
          900: '#0f172a',
          950: '#020617',
        },
        yellow: {
          400: '#FBBF24',
          300: '#FCD34D',
        },
      },
    },
  },
  plugins: [],
}
