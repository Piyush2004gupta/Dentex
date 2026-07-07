/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary Cyan
          600: '#0284c7', // Darker Cyan/Blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        medical: {
          blue: '#1d4ed8',
          cyan: '#06b6d4',
          dark: '#0f172a',
          light: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        glass: '12px',
      }
    },
  },
  plugins: [],
}
