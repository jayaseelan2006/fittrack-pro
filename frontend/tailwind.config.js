const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), surface2: v('surface2'), line: v('line'),
        ink: v('ink'), muted: v('muted'),
        accent: v('accent'), 'accent-ink': v('accent-ink'),
        danger: v('danger'), warn: v('warn'), info: v('info'),
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      boxShadow: { glow: '0 0 28px rgb(var(--accent) / 0.22)' },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fadeIn .35s ease-out', 'slide-up': 'slideUp .25s ease-out' },
    },
  },
  plugins: [],
};
