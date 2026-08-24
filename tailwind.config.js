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
        steel: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        pcp: {
          primary: '#1d4ed8', // blue-700
          secondary: '#0284c7', // sky-600
          accent: '#f59e0b', // amber-500
          success: '#10b981', // emerald-500
          danger: '#ef4444', // red-500
          warning: '#f97316', // orange-500
        }
      }
    },
  },
  plugins: [],
}
