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
        void: {
          950: '#030303',
          900: '#050508',
          850: '#07080e',
          800: '#0e111a',
          700: '#161b29',
        },
        mint: {
          DEFAULT: '#00ffaa',
          500: '#00ffaa',
          400: '#33ffbb',
          300: '#66ffcc',
        },
        obsidian: {
          950: '#030303',
          900: '#050508',
          850: '#07080e',
          800: '#0e111a',
          700: '#161b29',
          600: '#232b40',
        },
        cyber: {
          950: '#050508',
          900: '#07080e',
          850: '#0e111a',
          800: '#161b29',
          700: '#232b40',
          cyan: '#00ffaa',
          neon: '#00ffaa',
          purple: '#8b5cf6',
          violet: '#7c3aed',
          magenta: '#e11d48',
          gold: '#f59e0b',
          emerald: '#00ffaa',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', '"Space Grotesk"', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        brand: ['Outfit', 'sans-serif'],
        mono: ['"Space Mono"', '"DM Mono"', 'monospace'],
        body: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      animation: {
        'aurora-glow': 'aurora 12s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '50%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'mint-glow': '0 0 25px rgba(0, 255, 170, 0.25), 0 0 10px rgba(0, 255, 170, 0.15)',
        'indigo-glow': '0 0 25px rgba(99, 102, 241, 0.25), 0 0 10px rgba(99, 102, 241, 0.15)',
        'cyan-glow': '0 0 25px rgba(0, 255, 170, 0.25)',
        'glass-card': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 20px 40px -10px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.4)',
        'pill-nav': '0 20px 50px -10px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
