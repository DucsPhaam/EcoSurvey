/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        earth: {
          sand:    '#D9C9A8',
          beige:   '#E8DCC0',
          cream:   '#F2EAD3',
          clay:    '#B07D52',
          terracotta: '#A85B3E',
          moss:    '#7A8B5C',
          forest:  '#3E5240',
          ink:     '#1A1A1A',
          paper:   '#FAF6E9',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'marquee':    'marquee 20s linear infinite',
        'stamp':      'stamp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:  { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        marquee:  { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        stamp:    { '0%': { transform: 'scale(1.4) rotate(-8deg)', opacity: 0 }, '100%': { transform: 'scale(1) rotate(-8deg)', opacity: 1 } },
      },
      boxShadow: {
        'brutal':      '6px 6px 0 0 #1A1A1A',
        'brutal-sm':   '4px 4px 0 0 #1A1A1A',
        'brutal-lg':   '8px 8px 0 0 #1A1A1A',
        'brutal-moss': '6px 6px 0 0 #3E5240',
      },
    },
  },
  plugins: [],
}