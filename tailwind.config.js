/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#917523',
          50: '#fdf8ec',
          100: '#f9edcb',
          200: '#f3d992',
          300: '#ecbf55',
          400: '#e6a830',
          500: '#917523',
          600: '#7a6019',
          700: '#614b12',
          800: '#4a3810',
          900: '#38290c',
        },
        secondary: {
          DEFAULT: '#2C2E30',
          50: '#f5f5f5',
          100: '#e8e8e8',
          200: '#c5c5c5',
          300: '#a0a0a0',
          400: '#6b6b6b',
          500: '#2C2E30',
          600: '#252729',
          700: '#1d1f21',
          800: '#141618',
          900: '#0c0d0e',
        },
        tertiary: {
          DEFAULT: '#F8F9FA',
          100: '#ffffff',
          200: '#f8f9fa',
          300: '#e9ecef',
          400: '#dee2e6',
          500: '#ced4da',
        },
        neutral: {
          DEFAULT: '#6C757D',
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6C757D',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-in-only': 'fadeInOnly 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInOnly: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'primary': '0 4px 14px rgba(145, 117, 35, 0.35)',
      },
    },
  },
  plugins: [],
}
