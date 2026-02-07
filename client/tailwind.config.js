/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#2C2220',
        mid: '#5A4A42',
        muted: '#8A7B72',
        light: '#6B5B52',
        border: '#E8E0DA',
        bgWarm: '#FAFAF7',
        bgTan: '#F5F0EB',
        accent: '#B85042',
        accentLight: '#FDF0ED',
        green: '#1B7D3A',
        greenBg: '#E6F4EA',
        yellowBg: '#FEF7E0',
        yellowText: '#9A6C00',
        creator: '#1A6B5A',
        creatorLight: '#E8F5F0',
        creatorAccent: '#0D9488',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
