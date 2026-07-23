/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        earth: {
          // All colours now reference CSS custom-properties so that
          // switching the `.dark` class on <html> automatically
          // re-themes every component without touching JSX files.
          sand:       'var(--color-sand)',
          beige:      'var(--color-beige)',
          cream:      'var(--color-cream)',
          clay:       'var(--color-clay)',
          terracotta: 'var(--color-terracotta)',
          moss:       'var(--color-moss)',
          forest:     'var(--color-forest)',
          ink:        'var(--color-ink)',
          paper:      'var(--color-paper)',
        },
      },
      fontFamily: {
        sans:    ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans Vietnamese', 'Noto Sans', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'Segoe UI', 'serif'],
        mono:    ['Cascadia Code', 'JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        archivo: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out forwards',
        'fade-in-up':    'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-down':  'fadeInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-left':  'fadeInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-right': 'fadeInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-up':      'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in':      'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'soft-bounce':   'softBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'subtle-float': 'subtleFloat 6s ease-in-out infinite',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
        'marquee':      'marquee 25s linear infinite',
        'stamp':        'stamp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'line-grow':    'lineGrow 0.4s ease-out forwards',
        'blur-in':      'blurIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeInUp:     { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeInDown:   { '0%': { opacity: 0, transform: 'translateY(-24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeInLeft:   { '0%': { opacity: 0, transform: 'translateX(-24px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        fadeInRight:  { '0%': { opacity: 0, transform: 'translateX(24px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        slideUp:      { '0%': { transform: 'translateY(16px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        scaleIn:      { '0%': { transform: 'scale(0.92)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        softBounce:   { '0%': { transform: 'scale(0.9)', opacity: 0 }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        subtleFloat:  { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        gentlePulse:  { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        marquee:      { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        stamp:        { '0%': { transform: 'scale(1.3) rotate(-6deg)', opacity: 0 }, '100%': { transform: 'scale(1) rotate(-8deg)', opacity: 1 } },
        lineGrow:     { '0%': { width: '0%' }, '100%': { width: '100%' } },
        blurIn:       { '0%': { opacity: 0, filter: 'blur(12px)' }, '100%': { opacity: 1, filter: 'blur(0px)' } },
      },
      boxShadow: {
        'brutal':      '6px 6px 0 0 var(--color-ink)',
        'brutal-sm':   '4px 4px 0 0 var(--color-ink)',
        'brutal-lg':   '8px 8px 0 0 var(--color-ink)',
        'brutal-moss': '6px 6px 0 0 var(--color-forest)',
        'soft':        '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg':     '0 8px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
