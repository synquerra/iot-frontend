module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#071021',
        card: '#0f1b2a',
        muted: '#9aa7b2',
        accent: '#5eead4',
        primary: '#7c3aed'
      },
      borderRadius: {
        xl: '12px'
      }
    },
  },
  plugins: [],
}
