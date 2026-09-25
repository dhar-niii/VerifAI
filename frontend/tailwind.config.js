/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#090D16',
        surface: '#111827',
        edge: '#1F2937',
        ink: '#F9FAFB',
        mist: '#9CA3AF',
        tactical: '#2563EB',
        cyber: '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 12px 32px -16px rgba(0,0,0,0.8)',
        glowBlue: '0 0 0 1px rgba(37,99,235,0.35), 0 0 28px -6px rgba(37,99,235,0.45)',
        glowCyan: '0 0 0 1px rgba(6,182,212,0.3), 0 0 28px -6px rgba(6,182,212,0.4)',
        glowRed: '0 0 0 1px rgba(239,68,68,0.35), 0 0 28px -6px rgba(239,68,68,0.45)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        softPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        borderPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(6,182,212,0.5)' },
          '50%': { boxShadow: '0 0 0 4px rgba(6,182,212,0.18)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '100%': { transform: 'translate(-40px,-40px)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both',
        fadeIn: 'fadeIn 0.4s ease-out both',
        scaleIn: 'scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both',
        slideInRight: 'slideInRight 0.45s cubic-bezier(0.22,1,0.36,1) both',
        scanLine: 'scanLine 2.6s linear infinite',
        softPulse: 'softPulse 1.8s ease-in-out infinite',
        borderPulse: 'borderPulse 1.6s ease-in-out infinite',
        blink: 'blink 1.4s step-end infinite',
        drift: 'drift 14s linear infinite alternate',
      },
    },
  },
  plugins: [],
};
