/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1410',
        surface: '#2a2218',
        bronze: '#938938',
        'bronze-dark': '#726a2b',
        cream: '#e8dcc8',
        punch: '#8b2635',
        error: '#dd7c7c',
      },
      fontFamily: {
        ui: ['Oswald', 'sans-serif'],
        prose: ['"Courier Prime"', 'monospace'],
      },
    },
  },
  plugins: [],
}
