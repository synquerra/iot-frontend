/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx,css}"],
  theme: {
  	extend: {
  		colors: {
  			border: 'var(--mantine-color-default-border)',
  			input: 'var(--mantine-color-default-border)',
  			ring: 'var(--mantine-color-primary-outline)',
  			background: 'var(--mantine-color-body)',
  			foreground: 'var(--mantine-color-text)',
  			primary: {
  				DEFAULT: 'var(--mantine-color-primary-filled)',
  				foreground: 'var(--mantine-color-white)'
  			},
  			secondary: {
  				DEFAULT: 'var(--mantine-color-default)',
  				foreground: 'var(--mantine-color-text)'
  			},
  			destructive: {
  				DEFAULT: 'var(--mantine-color-red-filled)',
  				foreground: 'var(--mantine-color-white)'
  			},
  			muted: {
  				DEFAULT: 'var(--mantine-color-default-hover)',
  				foreground: 'var(--mantine-color-dimmed)'
  			},
  			accent: {
  				DEFAULT: 'var(--mantine-color-primary-light)',
  				foreground: 'var(--mantine-color-primary-light-color)'
  			},
  			card: {
  				DEFAULT: 'var(--mantine-color-body)',
  				foreground: 'var(--mantine-color-text)'
  			},
  			popover: {
  				DEFAULT: 'var(--mantine-color-body)',
  				foreground: 'var(--mantine-color-text)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--mantine-color-body)',
  				foreground: 'var(--mantine-color-text)',
  				primary: 'var(--mantine-color-primary-filled)',
  				'primary-foreground': 'var(--mantine-color-white)',
  				accent: 'var(--mantine-color-default-hover)',
  				'accent-foreground': 'var(--mantine-color-text)',
  				border: 'var(--mantine-color-default-border)',
  				ring: 'var(--mantine-color-primary-outline)'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--mantine-radius-md)',
  			md: 'var(--mantine-radius-sm)',
  			sm: 'var(--mantine-radius-xs)'
  		}
  	}
  },
  plugins: [],
};
