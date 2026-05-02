/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '360px',
      md: '640px',
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['Inter', 'ui-monospace', 'monospace'],
    },
    extend: {
      colors: {
        // ───────── VERDE BCH — protagonista (marca y acción)
        brand: {
          50:  '#E6F7F0',
          100: '#C2EBD8',
          200: '#94DCBC',
          300: '#5EC99B',
          400: '#3BB783',
          500: '#23A06D',
          600: '#1B8459',
          700: '#156945',
          800: '#0F4E33',
          900: '#0A3A26',
          DEFAULT: '#23A06D',
        },

        // Aliases por compatibilidad con clases existentes (`bg-primary`, etc.)
        primary: {
          50:  '#E6F7F0',
          100: '#C2EBD8',
          200: '#94DCBC',
          300: '#5EC99B',
          400: '#3BB783',
          500: '#23A06D',
          600: '#1B8459',
          700: '#156945',
          800: '#0F4E33',
          900: '#0A3A26',
          DEFAULT: '#23A06D',
        },
        primarydark: {
          50:  '#0A3A26',
          100: '#0F4E33',
          200: '#156945',
          300: '#1B8459',
          400: '#23A06D',
          500: '#3BB783',
          600: '#5EC99B',
          700: '#94DCBC',
          800: '#C2EBD8',
          900: '#E6F7F0',
          DEFAULT: '#3BB783',
        },

        // ───────── CELESTE — acento exclusivo del Bolsillo
        sky: {
          50:  '#F0F5FF',
          100: '#E2EAFB',
          200: '#C9D5F5',
          300: '#9BC7EE',
          400: '#7AB3E5',
          500: '#5FA0DB',
          600: '#4585C4',
          700: '#356CA6',
          800: '#264F7C',
          900: '#1B3A5C',
          DEFAULT: '#5FA0DB',
        },

        // ───────── NEUTROS — gris azulado
        neutral: {
          0:    '#FFFFFF',
          25:   '#FBFCFD',
          50:   '#F7F8FA',
          100:  '#EEF1F5',
          200:  '#E2E6EC',
          300:  '#CBD2DB',
          400:  '#9AA3B0',
          500:  '#6B7280',
          600:  '#4B5563',
          700:  '#374151',
          800:  '#1F2937',
          900:  '#0F172A',
          1000: '#0B1018',
          DEFAULT: '#6B7280',
        },

        // ───────── SEMÁNTICOS
        success: {
          light:   '#E6F7F0',
          DEFAULT: '#23A06D',
          dark:    '#156945',
        },
        error: {
          light:   '#FEE2E2',
          DEFAULT: '#DC2626',
          dark:    '#991B1B',
        },
        warn: {
          light:   '#FEF3C7',
          DEFAULT: '#D97706',
          dark:    '#92400E',
        },
        info: {
          light:   '#F0F5FF',
          DEFAULT: '#5FA0DB',
          dark:    '#356CA6',
        },

        black: '#000000',
        white: '#FFFFFF',
        transparent: 'transparent',
      },

      fontSize: {
        'display':     ['48px', { lineHeight: '52px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-sm':  ['36px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1':          ['28px', { lineHeight: '34px', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2':          ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'h3':          ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-md':     ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body':        ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'sm':          ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'xs':          ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'overline':    ['11px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.08em' }],
      },

      borderRadius: {
        'sm':  '6px',
        'md':  '10px',
        'lg':  '14px',
        'xl':  '18px',
        '2xl': '22px',
        '3xl': '28px',
      },

      boxShadow: {
        'card':     '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'elevated': '0 4px 16px rgba(15, 23, 42, 0.08)',
        'none':     'none',
      },

      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },

      transitionDuration: {
        '100': '100ms',
        '150': '150ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
