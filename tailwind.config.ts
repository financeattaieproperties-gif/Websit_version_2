import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#B8944A',
          navy: '#1A2335',
          ivory: '#F5EFE6',
          'gold-lt': '#F5E6C8',
        },
        status: {
          available: '#22C55E',
          pending: '#F59E0B',
          sold: '#EF4444',
          rented: '#3B82F6',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          300: '#D4D4D8',
          500: '#71717A',
          900: '#18181B',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        arabic: ['var(--font-tajawal)', 'sans-serif'],
      },
      maxWidth: { container: '1280px' },
      borderRadius: {
        btn: '8px',
        card: '16px',
        modal: '20px',
        input: '10px',
        img: '12px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.10)',
        lg: '0 8px 32px rgba(0,0,0,0.14)',
        gold: '0 4px 20px rgba(184,148,74,0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
