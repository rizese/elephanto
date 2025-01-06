// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'class' if you want manual control
  theme: {
    extend: {
      fontFamily: {
        questrial: ['Questrial', 'sans-serif'],
      },
      dropShadow: {
        logo: '-1px 3px 4px rgba(255, 255, 255, 0.8)',
      },
      colors: {
        'zinc-850': '#1b1b1f',
      },
      animation: {
        fadeIn: 'fadeIn ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
