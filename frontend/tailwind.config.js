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
        cyber: {
          950: '#030712',
          900: '#060d1f',
          850: '#0a1435',
          800: '#101f4e',
          700: '#1b2e75',
          cyan: '#00f0ff',
          neon: '#0df5e3',
          purple: '#9d4edd',
          violet: '#7928ca',
          magenta: '#ff007f',
          gold: '#ffd700',
          emerald: '#10b981',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', '"Space Grotesk"', 'sans-serif'],
        heading: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        brand: ['Syne', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        body: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
      },
      animation: {
        'aurora-glow': 'aurora 12s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
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
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '50%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 25px rgba(0, 240, 255, 0.35), 0 0 10px rgba(0, 240, 255, 0.2)',
        'neon-purple': '0 0 25px rgba(157, 78, 221, 0.35), 0 0 10px rgba(121, 40, 202, 0.2)',
        'neon-magenta': '0 0 25px rgba(255, 0, 127, 0.35)',
        'neon-gold': '0 0 25px rgba(255, 215, 0, 0.3)',
        'glass-card': '0 12px 40px 0 rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-hover': '0 20px 50px 0 rgba(0, 240, 255, 0.2), inset 0 1px 1px 0 rgba(0, 240, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
