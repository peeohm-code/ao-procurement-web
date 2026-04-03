import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AO Construction Brand Colors
        ao: {
          navy: '#00366D',      // Primary - dark navy
          green: '#00CE81',     // Accent - mint green
          'navy-light': '#004A8F',
          'navy-dark': '#002147',
          'green-light': '#33D89A',
          'green-dark': '#00A668',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
