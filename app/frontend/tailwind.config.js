/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	darkMode: "class", // Enable dark mode support
	theme: {
		extend: {
			colors: {
				// Horror theme colors
				horror: {
					50: "#fdf2f2",
					100: "#fde8e8",
					200: "#fbd5d5",
					300: "#f8b4b4",
					400: "#f98080",
					500: "#f05252",
					600: "#e02424",
					700: "#c81e1e",
					800: "#9b1c1c",
					900: "#771d1d",
					950: "#3f1414",
				},
				// Night theme colors (grays)
				night: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b",
					600: "#475569",
					700: "#334155",
					800: "#1e293b",
					900: "#0f172a",
					950: "#020617",
				},
				// Blood theme colors (reds)
				blood: {
					50: "#fef2f2",
					100: "#fee2e2",
					200: "#fecaca",
					300: "#fca5a5",
					400: "#f87171",
					500: "#ef4444",
					600: "#dc2626",
					700: "#b91c1c",
					800: "#991b1b",
					900: "#7f1d1d",
					950: "#450a0a",
				},
			},
			fontFamily: {
				horror: ["Creepster", "cursive"],
				sans: ["Inter", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "monospace"],
			},
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1rem" }],
				sm: ["0.875rem", { lineHeight: "1.25rem" }],
				base: ["1rem", { lineHeight: "1.5rem" }],
				lg: ["1.125rem", { lineHeight: "1.75rem" }],
				xl: ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
			},
			spacing: {
				18: "4.5rem",
				88: "22rem",
				128: "32rem",
			},
			animation: {
				flicker: "flicker 0.15s infinite linear",
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				float: "float 6s ease-in-out infinite",
				glow: "glow 2s ease-in-out infinite alternate",
				"fade-in": "fadeIn 0.5s ease-in-out",
				"slide-up": "slideUp 0.3s ease-out",
				"slide-down": "slideDown 0.3s ease-out",
				"scale-in": "scaleIn 0.2s ease-out",
				"bounce-gentle": "bounceGentle 2s infinite",
			},
			keyframes: {
				flicker: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.8" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-10px)" },
				},
				glow: {
					"0%": {
						boxShadow: "0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 15px #ef4444",
					},
					"100%": {
						boxShadow: "0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444",
					},
				},
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				slideDown: {
					"0%": { transform: "translateY(-10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				scaleIn: {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
				bounceGentle: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" },
				},
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				"gradient-horror": "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
				"gradient-blood": "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
				"gradient-night": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
			},
			backdropBlur: {
				xs: "2px",
			},
			boxShadow: {
				glow: "0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444",
				"glow-soft": "0 0 5px rgba(239, 68, 68, 0.3)",
				"glow-blood": "0 0 10px #dc2626, 0 0 20px #dc2626, 0 0 30px #dc2626",
				"inner-glow": "inset 0 0 10px rgba(239, 68, 68, 0.3)",
			},
			borderWidth: {
				3: "3px",
			},
			borderRadius: {
				"4xl": "2rem",
				"5xl": "2.5rem",
			},
			transitionDuration: {
				400: "400ms",
				600: "600ms",
			},
			transitionTimingFunction: {
				"bounce-gentle": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
			},
			zIndex: {
				60: "60",
				70: "70",
				80: "80",
				90: "90",
				100: "100",
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		// Custom plugin for horror theme utilities
		({ addUtilities, theme }) => {
			const newUtilities = {
				".text-glow": {
					textShadow: "0 0 10px #ef4444, 0 0 20px #ef4444, 0 0 30px #ef4444",
				},
				".text-glow-soft": {
					textShadow: "0 0 5px rgba(239, 68, 68, 0.5)",
				},
				".border-glow": {
					borderColor: "#ef4444",
					boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)",
				},
				".bg-horror-gradient": {
					background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
				},
				".bg-blood-gradient": {
					background: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)",
				},
				".backdrop-blur-horror": {
					backdropFilter: "blur(8px)",
					backgroundColor: "rgba(15, 23, 42, 0.8)",
				},
				".scrollbar-hide": {
					"-ms-overflow-style": "none",
					"scrollbar-width": "none",
					"&::-webkit-scrollbar": {
						display: "none",
					},
				},
				".scrollbar-thin": {
					"scrollbar-width": "thin",
					"scrollbar-color": "#475569 #1e293b",
					"&::-webkit-scrollbar": {
						width: "8px",
					},
					"&::-webkit-scrollbar-track": {
						background: "#1e293b",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "#475569",
						borderRadius: "4px",
					},
					"&::-webkit-scrollbar-thumb:hover": {
						background: "#64748b",
					},
				},
			};
			addUtilities(newUtilities);
		},
	],
};
