/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#b88e7d',
          600: '#a3715e',
          700: '#8c5846',
          800: '#734435',
          900: '#5c3528',
          DEFAULT: '#8c5846', // Warm coffee tone
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981', // Fresh green tea tone
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
