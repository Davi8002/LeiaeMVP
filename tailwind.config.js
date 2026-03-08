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
          paper: '#fff8ef',
        },
      },
      fontFamily: {
        display: ['Trebuchet MS', 'Verdana', 'sans-serif'],
        body: ['Segoe UI', 'Trebuchet MS', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 16px 30px rgba(69, 42, 21, 0.14)',
        app: '0 26px 55px rgba(39, 21, 12, 0.22)',
        card: '0 10px 24px rgba(69, 42, 21, 0.12)',
      },
      borderRadius: {
        app: '2rem',
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
      backgroundImage: {
        grainWarm:
          'radial-gradient(circle at 8% 10%, rgba(217,79,46,0.12), transparent 35%), radial-gradient(circle at 88% 20%, rgba(39,21,12,0.08), transparent 38%), linear-gradient(180deg, #f7ede1 0%, #f3e6d7 100%)',
      },
    },
  },
  plugins: [],
};
