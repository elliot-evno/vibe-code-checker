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
      },
      gradient: {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
      },
    },
    animation: {
      fadeIn: 'fadeIn 0.3s ease-in',
      slideIn: 'slideIn 0.4s ease-out',
      gradient: 'gradient 8s ease infinite',
    },
    scale: {
      '102': '1.02',
    },
    backgroundColor: {
      'white/80': 'rgba(255, 255, 255, 0.8)',
    },
    backgroundSize: {
      '300%': '300%',
    },
  },
} 