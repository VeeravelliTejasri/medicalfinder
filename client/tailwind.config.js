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
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Medical Teal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        medical: {
          blue: '#0284c7', // Trust Blue
          dark: '#0f172a',
          light: '#f8fafc',
          available: '#10b981', // In Stock Green
          low: '#f59e0b', // Low Stock Amber
          out: '#ef4444', // Out of Stock Red
          emergency: '#dc2626' // Emergency Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        'glow-teal': '0 0 25px rgba(20, 184, 166, 0.35)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.45)',
      }
    },
  },
  plugins: [],
}
