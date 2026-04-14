import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tillas: {
          bg: 'var(--tillas-bg)',
          surface: 'var(--tillas-surface)',
          'surface-elevated': 'var(--tillas-surface-elevated)',
          border: 'var(--tillas-border)',
          primary: 'var(--tillas-primary)',
          'primary-dark': 'var(--tillas-primary-dark)',
          text: 'var(--tillas-text)',
          'text-secondary': 'var(--tillas-text-secondary)',
          'text-muted': 'var(--tillas-text-muted)',
          success: 'var(--tillas-success)',
          error: 'var(--tillas-error)',
          warning: 'var(--tillas-warning)',
          glass: 'var(--tillas-glass)',
          'glass-border': 'var(--tillas-glass-border)',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
