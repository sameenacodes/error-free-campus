/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#635BFF', 50: '#f0efff', 100: '#e4e3ff', 500: '#635BFF', 600: '#4f48e8', 700: '#3d37c9' },
        secondary: '#4F7CFF',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: '#F4F6FF',
        card: '#FFFFFF',
        textMain: '#172033',
        textMuted: '#64748B',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 8px 30px rgba(60, 60, 120, 0.08)',
        'card-hover': '0 12px 40px rgba(60, 60, 120, 0.14)',
        'dropdown': '0 10px 40px rgba(60, 60, 120, 0.15)',
      },
      borderRadius: { '2xl': '16px', '3xl': '24px' },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: '0', transform: 'translateX(-16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
