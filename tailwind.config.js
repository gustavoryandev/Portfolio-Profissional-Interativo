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
        win: 'var(--win)',
        loss: 'var(--loss)',
        page: 'var(--page)',
        panel: { DEFAULT: 'var(--panel)', soft: 'var(--panel-soft)' },
        line: 'var(--line)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        brand: {
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
}