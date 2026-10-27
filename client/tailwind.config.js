/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0E1A2B',
          2: '#3D4B5F',
          3: '#5B6878',
        },
        line: {
          DEFAULT: '#E3E7EE',
          strong: '#C9D1DD',
        },
        mist: '#F5F7FA',
        royal: {
          50: '#EAF0FF',
          100: '#DCE4FF',
          300: '#8EA2EC',
          500: '#2347D6',
          600: '#1B38AE',
        },
        saffron: {
          50: '#FFF1E6',
          300: '#FFB47F',
          500: '#F2762E',
          700: '#9A4210',
          900: '#6B2E0B',
        },
        leaf: {
          50: '#E6F5EF',
          600: '#12805C',
          700: '#0D6B4C',
          900: '#0D4F39',
        },
        danger: {
          50: '#FDECEC',
          600: '#A11D1D',
        },
        whatsapp: '#128C4B',
        night: {
          DEFAULT: '#0E1A2B',
          2: '#18273D',
          3: '#2A3A52',
          text: '#C5CEDB',
        },
      },
      fontFamily: {
        sans: ['Figtree', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Figtree', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
      },
      boxShadow: {
        card: '0 24px 48px -32px rgba(14, 26, 43, 0.30)',
        lift: '0 24px 48px -24px rgba(14, 26, 43, 0.25)',
        royal: '0 12px 24px -10px rgba(35, 71, 214, 0.60)',
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
  plugins: [],
}
