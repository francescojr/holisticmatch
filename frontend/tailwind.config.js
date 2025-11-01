/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13ec80",
        "background-light": "#f6f8f7",
        "background-dark": "#102219",
        "card-light": "#ffffff",
        "card-dark": "#182c22",
        "text-light": "#111814",
        "text-dark": "#ffffff",
        "subtext-light": "#618975",
        "subtext-dark": "#a0b5a9",
        "border-light": "#dbe6e0",
        "border-dark": "#2a3f34",
        "accent-blue": "#3b82f6",
        "accent-red": "#ef4444",
        "accent-yellow": "#eab308",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
