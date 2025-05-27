/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "spin-slow-reverse": "spin-reverse 8s linear infinite",
      },
      keyframes: {
        "spin-reverse": {
          to: { transform: "rotate(-360deg)" },
        },
      },
    },
  },
  plugins: [],
} 