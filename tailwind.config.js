/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        leiae: {
          bg: '#f7ede1',
          accent: '#d94f2e',
          text: '#452a15',
          dark: '#27150c',
        },
      },
      fontFamily: {
        display: ['Palatino Linotype', 'Book Antiqua', 'Palatino', 'serif'],
        body: ['Trebuchet MS', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 14px 40px rgba(39, 21, 12, 0.16)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
