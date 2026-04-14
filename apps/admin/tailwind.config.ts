import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#0A0A0A',
          surface: '#1C1C1E',
          card: '#2C2C2E',
          elevated: '#3A3A3C',
          border: '#475569',
          primary: '#FF3B30',
          'primary-dark': '#E02720',
          text: '#FFFFFF',
          'text-secondary': '#A1A1A6',
          'text-muted': '#71717A',
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
