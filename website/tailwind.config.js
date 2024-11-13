module.exports = {
  content: [
    './src/**/*.{js,jsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideIn: 'slideIn 0.5s ease-out',
        slideDown: 'slideDown 0.5s ease-out',
      },
    },
  },
  plugins: [],
};