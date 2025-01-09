/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      width: {
        '76': '19rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};