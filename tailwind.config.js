/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: warm vermilion/red-orange — old Japanese train signage
        primary: {
          50:  '#fff5f0',
          100: '#ffe8dc',
          200: '#ffcdb5',
          300: '#ffaa80',
          400: '#ff7d45',
          500: '#e8541a',  // main primary
          600: '#c93e0e',
          700: '#a33009',
          800: '#7e2508',
          900: '#5c1c06',
          950: '#350f02',
        },
        // Board: warm cream/aged paper — retro station feel
        board: {
          50:  '#fdfaf3',
          100: '#f9f2e0',
          200: '#f2e3bb',
          300: '#e8ce8c',
          400: '#dcb45b',
          500: '#c99a36',
          600: '#a97d28',
          700: '#816020',
          800: '#614a1c',
          900: '#4a3818',
          950: '#281f0c',
        },
        // Accent: deep navy — train route map lines
        accent: {
          50:  '#eef2ff',
          100: '#dde6ff',
          200: '#b9ceff',
          300: '#85aaff',
          400: '#497dff',
          500: '#1a4fff',
          600: '#0031e8',
          700: '#0028c4',
          800: '#002199',
          900: '#011d6e',  // main accent
          950: '#010c3d',
        },
        // Sea: blue-green for coastal/nature squares
        sea: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Forest: muted green for nature squares
        forest: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Gold: for item/special squares
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
      fontFamily: {
        // System fonts that work well for Japanese text
        sans: [
          '"Hiragino Kaku Gothic ProN"',
          '"Noto Sans JP"',
          '"Yu Gothic"',
          '"Meiryo"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '"Hiragino Mincho ProN"',
          '"Noto Serif JP"',
          '"Yu Mincho"',
          'Georgia',
          'serif',
        ],
      },
      borderRadius: {
        'card': '12px',
        'square': '8px',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0,0,0,0.18)',
        'square': '0 2px 6px rgba(0,0,0,0.14)',
        'player': '0 0 0 3px white, 0 0 0 5px currentColor',
      },
      keyframes: {
        bounce_soft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '40%': { transform: 'rotate(8deg)' },
          '60%': { transform: 'rotate(-5deg)' },
          '80%': { transform: 'rotate(5deg)' },
        },
        pop_in: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slide_up: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        bounce_soft: 'bounce_soft 1s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        pop_in: 'pop_in 0.3s ease-out forwards',
        slide_up: 'slide_up 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
}
