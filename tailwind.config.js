
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#22C55E',
        bg: '#F8FAFC'
      },
      borderRadius: {
        xl2: '1rem'
      }
    },
    fontFamily: {
      sans: ['"Noto Sans SC"', 'Inter', 'ui-sans-serif', 'system-ui']
    }
  },
  plugins: []
}
