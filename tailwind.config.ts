import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
				'3xl': '2200px'
			}
		},
		fontSize: {
			xs: ["0.75rem", "1rem"],
			sm: ["0.875rem", "1.25rem"],
			base: ["1rem", "1.30rem"],
			lg: ["1.125rem", "1.35rem"],
			xl: ["1.25rem", "1.75rem"],
			"2xl": ["1.5rem", "2rem"],
			"3xl": ["1.95rem", "2.25rem"],
			"4xl": ["2.25rem", "2.5rem"],
			"5xl": ["3rem", "1"],
			"6xl": ["3.75rem", "1"],
			"7xl": ["4.5rem", "1"],
			"8xl": ["6rem", "1"],
			"9xl": ["8rem", "1"],
		},
		colors: {
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			cdtm: {
				blue: '#1E3A8A',
				light: '#3B82F6',
			},
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			sidebar: {
				DEFAULT: 'hsl(var(--sidebar-background))',
				foreground: 'hsl(var(--sidebar-foreground))',
				primary: 'hsl(var(--sidebar-primary))',
				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
				accent: 'hsl(var(--sidebar-accent))',
				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
				border: 'hsl(var(--sidebar-border))',
				ring: 'hsl(var(--sidebar-ring))'
			},
			transparent: "transparent",
			current: "currentColor",
			inherit: "inherit",
			black: colors.black,
			white: colors.white,
			pink: colors.pink,
			violet: colors.violet,
			gray: colors.zinc,
			red: {
				"50": "#fef2f2",
				"100": "#fee2e2",
				"200": "#fecaca",
				"300": "#fca5a5",
				DEFAULT: "#ef4444",
				"400": "#ef4444",
				"500": "#dc2626",
				"600": "#b91c1c",
				"700": "#991b1b",
				"800": "#7f1d1d",
				"900": "#6b1a1a",
				"950": "#450a0a",
			},
			green: {
				"50": "#f9fce9",
				"100": "#eff7d0",
				"200": "#e0efa7",
				"300": "#cae373",
				DEFAULT: "#b0d243",
				"400": "#b0d243",
				"500": "#94b929",
				"600": "#73931d",
				"700": "#57701b",
				"800": "#47591b",
				"900": "#3c4c1b",
				"950": "#1f2a09",
			},
			blue: {
				50: "#FAFCFF",
				100: "#F1F6FE",
				200: "#E4EDF0",
				300: "#B8D4F9",
				400: "#92BEF6",
				500: "#68A4F3",
				600: "#2B7FEE",
				DEFAULT: "#0D4DA1",
				700: "#0D4DA1",
				800: "#0A3D7F",
				900: "#082F63",
				950: "#041934",
			},
			recruitingOrange: {
				"50": "#fff7eb",
				"100": "#fde8c8",
				"200": "#fbd18c",
				"300": "#f9b350",
				DEFAULT: "#f89d33",
				"400": "#f89d33",
				"500": "#f1740f",
				"600": "#d65209",
				"700": "#b1350c",
				"800": "#902a10",
				"900": "#762311",
				"950": "#440e04",
			},
			recruitingRose: {
				"50": "#faf5fa",
				"100": "#f7ecf6",
				"200": "#f0daef",
				"300": "#e5bce2",
				"400": "#d393ce",
				"500": "#c371bb",
				DEFAULT: "#b35fa6",
				"600": "#b35fa6",
				"700": "#944285",
				"800": "#7b396e",
				"900": "#68335d",
				"950": "#3e1937",
			},
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		},
		keyframes: {
			'accordion-down': {
				from: {
					height: '0'
				},
				to: {
					height: 'var(--radix-accordion-content-height)'
				}
			},
			'accordion-up': {
				from: {
					height: 'var(--radix-accordion-content-height)'
				},
				to: {
					height: '0'
				}
			},
			'fade-in': {
				'0%': { opacity: '0' },
				'100%': { opacity: '1' }
			},
			'fade-out': {
				'0%': { opacity: '1' },
				'100%': { opacity: '0' }
			},
			'scale-in': {
				'0%': { transform: 'scale(0.95)', opacity: '0' },
				'100%': { transform: 'scale(1)', opacity: '1' }
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
			'fade-in': 'fade-in 0.3s ease-out',
			'fade-out': 'fade-out 0.3s ease-out',
			'scale-in': 'scale-in 0.2s ease-out',
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-avenir)"],
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
