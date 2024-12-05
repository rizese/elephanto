// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // or 'class' if you want manual control
  theme: {
    extend: {
      fontFamily: {
        questrial: ['Questrial', 'sans-serif']
      },
      dropShadow: {
        logo: '-1px 3px 4px rgba(255, 255, 255, 0.8)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
