/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'rubik': ['"Rubik"', 'cursive'],
      },
      colors: {
        primary: '#0082C6'
      }
    },
  },
  plugins: [],
}
