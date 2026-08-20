/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        corporate: {
          950: '#0a1628',
          900: '#0f2744',
          800: '#153a5c',
          700: '#1e4976',
          600: '#2a5f94',
        },
        slate: {
          850: '#1b2432',
        },
        flux: {
          void: '#070712',
          panel: '#0c1020',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'flux-card':
          '0 0 0 1px rgba(255,255,255,0.85) inset, 0 2px 4px -2px rgba(14,165,233,0.12), 0 16px 48px -16px rgba(99,102,241,0.14), 0 24px 64px -28px rgba(15,23,42,0.08)',
        'flux-sidebar':
          '4px 0 32px -12px rgba(99,102,241,0.1), 1px 0 0 rgba(255,255,255,0.7) inset',
        'flux-header':
          '0 1px 0 rgba(255,255,255,0.75) inset, 0 12px 40px -20px rgba(14,165,233,0.08)',
      },
      keyframes: {
        'flux-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.992)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'flux-glow': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        'flux-fade-up': 'flux-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'flux-glow': 'flux-glow 4s ease-in-out infinite',
      },
      transitionTimingFunction: {
        flux: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-primeui')],
};
