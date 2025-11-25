/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'highlight-pulse': 'highlight-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8)',
          },
        },
        'highlight-pulse': {
          '0%': {
            opacity: '0.6',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.02)',
          },
          '100%': {
            opacity: '0.6',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}