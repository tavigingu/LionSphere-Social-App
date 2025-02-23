/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Definim keyframes-urile
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
      // Definim animațiile care folosesc keyframes-urile
      animation: {
        drift: 'drift 20s infinite ease-in-out',
        'drift-slow': 'drift-slow 30s infinite ease-in-out',
        "pulse-slow": "pulse-slow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [require("daisyui")],
}