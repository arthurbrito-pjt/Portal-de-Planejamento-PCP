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
        cedisa: {
          navy: '#0B1F3A',          // Azul escuro principal Cedisa
          'navy-dark': '#05101E',   // Azul escuro profundo (sidebar e contrastes)
          'navy-light': '#163866',  // Azul escuro intermediário (hover/seleção)
          'navy-surface': '#1E487C',// Azul escuro para bordas/superfícies
          orange: '#FF6B00',        // Laranja vibrante Cedisa (cor secundária)
          'orange-hover': '#EA580C',
          'orange-light': '#FFF7ED',
          'orange-dark': '#C2410C',
          'orange-border': '#FDBA74',
        },
        pcp: {
          primary: '#0B1F3A',       // Azul escuro Cedisa
          secondary: '#FF6B00',     // Laranja Cedisa
          accent: '#EA580C',        // Laranja escuro Cedisa
          success: '#10b981',       // emerald-500
          danger: '#ef4444',        // red-500
          warning: '#f97316',       // orange-500
        }
      }
    },
  },
  plugins: [],
}
