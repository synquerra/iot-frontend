module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Enhanced comprehensive color system
      colors: {
        // Maintain existing colors for backward compatibility
        bg: '#0f1115ff',
        card: '#0f1b2a',
        muted: '#9aa7b2',
        accent: '#5eead4',
        primary: '#7c3aed',
        
        // Comprehensive spectrum colors with intensity variants
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          subtle: '#a78bfa',
          vibrant: '#8b5cf6',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          subtle: '#60a5fa',
          vibrant: '#3b82f6',
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
          subtle: '#22d3ee',
          vibrant: '#06b6d4',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
          subtle: '#2dd4bf',
          vibrant: '#14b8a6',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          subtle: '#4ade80',
          vibrant: '#22c55e',
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
          subtle: '#a3e635',
          vibrant: '#84cc16',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
          subtle: '#facc15',
          vibrant: '#eab308',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          subtle: '#fbbf24',
          vibrant: '#f59e0b',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          subtle: '#fb923c',
          vibrant: '#f97316',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          subtle: '#f87171',
          vibrant: '#ef4444',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
          subtle: '#f472b6',
          vibrant: '#ec4899',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
          subtle: '#c084fc',
          vibrant: '#a855f7',
        },
        
        // Enhanced semantic colors
        surface: {
          primary: '#0f1b2a',
          secondary: '#1a2332',
          tertiary: '#243142',
          background: '#071021',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          tertiary: '#64748b',
          muted: '#9aa7b2',
          inverse: '#0f172a',
        },
        border: {
          primary: '#334155',
          secondary: '#475569',
          accent: '#5eead4',
          muted: '#1e293b',
        },
        status: {
          success: '#22c55e',
          successSubtle: '#4ade80',
          warning: '#f59e0b',
          warningSubtle: '#fbbf24',
          error: '#ef4444',
          errorSubtle: '#f87171',
          info: '#3b82f6',
          infoSubtle: '#60a5fa',
        },
        interactive: {
          primary: '#7c3aed',
          primaryHover: '#6d28d9',
          primarySubtle: '#a78bfa',
          secondary: '#1a2332',
          secondaryHover: '#243142',
          accent: '#5eead4',
          accentHover: '#2dd4bf',
          accentSubtle: '#2dd4bf',
        },
      },
      
      // Enhanced background gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1a2332 0%, #243142 100%)',
        'gradient-success': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-warning': 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
        'gradient-error': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-info': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'gradient-rainbow': 'linear-gradient(135deg, #ec4899 0%, #a855f7 25%, #3b82f6 50%, #22c55e 75%, #f59e0b 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #a855f7 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #7c3aed 100%)',
        'gradient-forest': 'linear-gradient(135deg, #84cc16 0%, #22c55e 50%, #14b8a6 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #ec4899 100%)',
      },
      
      // Enhanced typography
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      // Responsive spacing utilities
      spacing: {
        // Touch-friendly spacing for mobile
        'touch-sm': '2.75rem',   // 44px - minimum touch target
        'touch-md': '3rem',      // 48px - comfortable touch target
        'touch-lg': '3.5rem',    // 56px - large touch target
        
        // Responsive container spacing
        'container-sm': '1rem',   // 16px on mobile
        'container-md': '1.5rem', // 24px on tablet
        'container-lg': '2rem',   // 32px on desktop
      },
      
      // Enhanced border radius with responsive considerations
      borderRadius: {
        xl: '12px', // Maintain existing
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
      },
      
      // Enhanced shadows for elevation with responsive behavior
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        // Responsive touch feedback shadows
        'touch-sm': '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        'touch-md': '0 4px 8px -1px rgb(0 0 0 / 0.15), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'touch-lg': '0 8px 16px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      
      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(139, 92, 246, 0.5), 0 0 10px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3)' 
          },
        },
      },
      
      // Animation utilities
      animation: {
        'fade-in': 'fade-in 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slide-up 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'glow': 'glow 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      
      // Drop shadow utilities for glow effects
      dropShadow: {
        'glow': [
          '0 0 5px rgba(139, 92, 246, 0.5)',
          '0 0 10px rgba(139, 92, 246, 0.3)',
          '0 0 15px rgba(139, 92, 246, 0.1)',
        ],
        'glow-blue': [
          '0 0 5px rgba(59, 130, 246, 0.5)',
          '0 0 10px rgba(59, 130, 246, 0.3)',
          '0 0 15px rgba(59, 130, 246, 0.1)',
        ],
        'glow-teal': [
          '0 0 5px rgba(20, 184, 166, 0.5)',
          '0 0 10px rgba(20, 184, 166, 0.3)',
          '0 0 15px rgba(20, 184, 166, 0.1)',
        ],
        'glow-green': [
          '0 0 5px rgba(34, 197, 94, 0.5)',
          '0 0 10px rgba(34, 197, 94, 0.3)',
          '0 0 15px rgba(34, 197, 94, 0.1)',
        ],
        'glow-amber': [
          '0 0 5px rgba(245, 158, 11, 0.5)',
          '0 0 10px rgba(245, 158, 11, 0.3)',
          '0 0 15px rgba(245, 158, 11, 0.1)',
        ],
        'glow-red': [
          '0 0 5px rgba(239, 68, 68, 0.5)',
          '0 0 10px rgba(239, 68, 68, 0.3)',
          '0 0 15px rgba(239, 68, 68, 0.1)',
        ],
        'glow-pink': [
          '0 0 5px rgba(236, 72, 153, 0.5)',
          '0 0 10px rgba(236, 72, 153, 0.3)',
          '0 0 15px rgba(236, 72, 153, 0.1)',
        ],
        'glow-purple': [
          '0 0 5px rgba(168, 85, 247, 0.5)',
          '0 0 10px rgba(168, 85, 247, 0.3)',
          '0 0 15px rgba(168, 85, 247, 0.1)',
        ],
      },
      
      // Transition durations with responsive considerations
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
        'slower': '500ms',
        // Mobile-optimized durations (faster for better perceived performance)
        'mobile-fast': '100ms',
        'mobile-normal': '200ms',
        'mobile-slow': '300ms',
      },
      
      // Transition timing functions
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
