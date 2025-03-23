module.exports = {
  // ... other config
  extend: {
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideIn: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      }
    },
    animation: {
      fadeIn: 'fadeIn 0.3s ease-in',
      slideIn: 'slideIn 0.4s ease-out',
    },
    scale: {
      '102': '1.02',
    },
    backgroundColor: {
      'white/80': 'rgba(255, 255, 255, 0.8)',
    }
  },
} 