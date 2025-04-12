/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Define keyframes
      keyframes: {
        drift: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(50px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'drift-slow': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(30px)' },
          '100%': { transform: 'translateX(0)' },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        }
      },
      // Define animations that use keyframes
      animation: {
        drift: 'drift 20s infinite ease-in-out',
        'drift-slow': 'drift-slow 30s infinite ease-in-out',
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
      },
      // Add custom fonts
      fontFamily: {
        'dancing': ['"Dancing Script"', 'cursive'],
      },
      // Add custom gap for tighter spacing
      gap: {
        '2': '0.5rem', // 8px, pentru a testa o distanță mai mică
      },
    },
  },
  plugins: [require("daisyui")],
}