/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
 content: [
  './src/app/**/*.{js,ts,jsx,tsx}',     
  './src/pages/**/*.{js,ts,jsx,tsx}',   
 './components/**/*.{js,ts,jsx,tsx}',   
],
   theme: {
      extend: {
        fontFamily: {
          // define your fonts using the CSS variables
          geist: ['var(--font-geist-sans)'],
          geistMono: ['var(--font-geist-mono)'],
          inter: ['var(--font-inter)'],
          lato: ['var(--font-lato)', 'sans-serif'],
          poppins: ['var(--font-poppins)'],
        },
      },
    },
    plugins: [],
  };
  
