/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': 'var(--color-background)',
        'background-alt': 'var(--color-background-alt)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-inverted': 'var(--color-text-inverted)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'border-subtle': 'var(--color-border-subtle)',
        /* Beach Holiday Palette - All using CSS variables for consistency */
        'deep-teal': 'var(--color-deep-teal)',
        'warm-coral': 'var(--color-warm-coral)',
        'turquoise': 'var(--color-turquoise)',
        'light-turquoise': 'var(--color-light-turquoise)',
        'warm-gold': 'var(--color-warm-gold)',
        'fresh-green': 'var(--color-fresh-green)',
        'redemption-green': 'var(--color-redemption-green)',
        'cream': 'var(--color-cream)',
        'light-cream': 'var(--color-light-cream)',
        'dark-text': 'var(--color-text-primary)',
        'light-text': 'var(--color-text-secondary)',
        'brand-white': 'var(--color-brand-white)',
        'brand-red': 'var(--color-brand-red)',
        'brand-yellow': 'var(--color-brand-yellow)',
        'brand-dark-blue': 'var(--color-brand-dark-blue)',
        'brand-light-text': 'var(--color-brand-light-text)',
        'warn-color': 'var(--color-warm-gold)',
        'error-color': '#F44336',
        'info-color': '#2196F3',
      },
      textColor: {
        'button-text-light': 'var(--color-text-inverted)',
        'button-text-dark': 'var(--color-text-primary)',
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Poppins', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
