/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          orange: '#FF8C32',
          amber: '#FFB347',
          cream: '#FFF8E7',
          dusk: '#2D1B69',
          night: '#0A0A1A',
          dawn: '#FF6B6B',
          forest: '#2D5A27',
          'forest-light': '#4A8C3F',
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'display': ['Georgia', 'serif']
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'twinkle': 'twinkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { opacity: '0.8', boxShadow: '0 0 10px rgba(255,140,50,0.5)' },
          '50%': { opacity: '1', boxShadow: '0 0 25px rgba(255,140,50,0.9)' }
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
