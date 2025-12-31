/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-cyan': {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)' },
        },
        'pulse-glow-cyan': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(6, 182, 212, 0.3), 0 0 10px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'capture': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'exorcise': {
          '0%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(10deg)', opacity: '0.5' },
          '100%': { transform: 'scale(0) rotate(20deg)', opacity: '0' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(10px, -20px) rotate(5deg)' },
          '50%': { transform: 'translate(-10px, -40px) rotate(-5deg)' },
          '75%': { transform: 'translate(15px, -60px) rotate(3deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-15px, -30px) rotate(-7deg)' },
          '50%': { transform: 'translate(20px, -60px) rotate(7deg)' },
          '75%': { transform: 'translate(-10px, -90px) rotate(-3deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-20px, -25px) rotate(-5deg)' },
          '50%': { transform: 'translate(15px, -50px) rotate(5deg)' },
          '75%': { transform: 'translate(-15px, -75px) rotate(-7deg)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-glow-cyan': 'pulse-glow-cyan 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'capture': 'capture 0.5s ease-in-out',
        'exorcise': 'exorcise 0.6s ease-in-out forwards',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'sparkle': 'sparkle 0.8s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float-slow 12s ease-in-out infinite',
        'float-reverse': 'float-reverse 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
