/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep space palette
        space: {
          950: '#050510',
          900: '#0a0a1a',
          800: '#0f0f2a',
          700: '#14143a',
          600: '#1a1a4a',
          500: '#252560',
        },
        // Neon accent system
        neon: {
          purple: '#7c3aed',
          violet: '#6366f1',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          pink: '#ec4899',
          emerald: '#10b981',
        },
        glass: {
          white: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.10)',
          hover: 'rgba(255,255,255,0.10)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px #6366f1, 0 0 10px #6366f1' },
          to: { boxShadow: '0 0 20px #6366f1, 0 0 60px #6366f1, 0 0 100px #6366f1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: 0, transform: 'translateY(-16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.92)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
        bounceIn: {
          from: { opacity: 0, transform: 'scale(0.3)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.37)',
        'neon': '0 0 20px rgba(99,102,241,0.5)',
        'neon-lg': '0 0 40px rgba(99,102,241,0.6)',
        'inner-glow': 'inset 0 0 30px rgba(99,102,241,0.15)',
      },
    },
  },
  plugins: [],
};
