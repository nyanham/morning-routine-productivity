/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          100: '#f9c4cc',
          200: '#f4a0ac',
          400: '#e06088',
          600: '#cc1034',
          800: '#6b0a1e',
        },
        vanilla: {
          100: '#f5e6c8',
          200: '#edd9a3',
          400: '#c4a84d',
          600: '#9a8232',
          800: '#5c4e1f',
        },
        aqua: {
          100: '#b8f0ec',
          200: '#80e5dd',
          400: '#42d4c8',
          600: '#14a89e',
          800: '#0c706a',
        },
        sky: {
          100: '#bde4ef',
          200: '#8ecfdf',
          400: '#5ab4ca',
          600: '#2d8fa8',
          800: '#1a5e72',
        },
        primary: {
          50: '#e6f9f7',
          100: '#b8f0ec',
          200: '#80e5dd',
          300: '#61ddd3',
          400: '#42d4c8',
          500: '#28beb3',
          600: '#14a89e',
          700: '#108c84',
          800: '#0c706a',
          900: '#084f4a',
        },
        accent: {
          50: '#fef0f2',
          100: '#f9c4cc',
          200: '#f4a0ac',
          300: '#ec7e94',
          400: '#e06088',
          500: '#d63a60',
          600: '#cc1034',
          700: '#a00d2a',
          800: '#6b0a1e',
          900: '#450814',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
