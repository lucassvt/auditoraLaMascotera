/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de La Mascotera
        'mascotera': {
          'dark': '#0a1628',      // Fondo principal oscuro
          'darker': '#061020',    // Fondo más oscuro
          'card': '#0d1f35',      // Fondo de tarjetas
          'border': '#1a3a5c',    // Bordes
          'accent': '#00d4aa',    // Verde/Cyan principal
          'accent-light': '#00ffcc',
          'yellow': '#f0c040',    // Amarillo para títulos
          'text': '#e0e8f0',      // Texto principal
          'text-muted': '#6b8299', // Texto secundario
          'success': '#10b981',   // Verde éxito
          'warning': '#f59e0b',   // Amarillo advertencia
          'danger': '#ef4444',    // Rojo peligro
          'info': '#3b82f6',      // Azul información
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 170, 0.3)',
        'glow-yellow': '0 0 20px rgba(240, 192, 64, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
