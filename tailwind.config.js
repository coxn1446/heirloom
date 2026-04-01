/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        heirloom: {
          tomato: '#d7463c',
          'soft-yellow': '#f4e8a6',
          sage: '#9ebf8d',
          beige: '#f3e8dd',
          earthy: '#4e7c5a',
        },
      },
      fontFamily: {
        sans: [
          '"Architects Daughter"',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
