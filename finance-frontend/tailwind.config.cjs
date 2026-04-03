/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4fbf8',
          100: '#e5f6ef',
          500: '#0f9d74',
          700: '#0f5e49',
          900: '#0a2f26',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 12px 30px rgba(10, 47, 38, 0.12)',
      },
    },
  },
  plugins: [],
};