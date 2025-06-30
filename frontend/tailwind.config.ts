import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: "2rem",
  		screens: {
  			"2xl": "1400px",
  		},
  	},
  	extend: {
  		colors: {
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))",
  				50: "#f0f9ff",
  				100: "#e0f2fe",
  				200: "#bae6fd",
  				300: "#7dd3fc",
  				400: "#38bdf8",
  				500: "#0ea5e9",
  				600: "#0284c7",
  				700: "#0369a1",
  				800: "#075985",
  				900: "#0c4a6e",
  				950: "#082f49",
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))",
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
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))",
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))",
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))",
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))",
  			},
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))",
  			},
  			teal: {
  				50: "#f0fdfa",
  				100: "#ccfbf1",
  				200: "#99f6e4",
  				300: "#5eead4",
  				400: "#2dd4bf",
  				500: "#14b8a6",
  				600: "#0d9488",
  				700: "#0f766e",
  				800: "#115e59",
  				900: "#134e4a",
  				950: "#042f2e",
  			},
  			sky: {
  				50: "#f0f9ff",
  				100: "#e0f2fe",
  				200: "#bae6fd",
  				300: "#7dd3fc",
  				400: "#38bdf8",
  				500: "#0ea5e9",
  				600: "#0284c7",
  				700: "#0369a1",
  				800: "#075985",
  				900: "#0c4a6e",
  				950: "#082f49",
  			},
  			slate: {
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
  			gray: {
  				50: "#f9fafb",
  				100: "#f3f4f6",
  				200: "#e5e7eb",
  				300: "#d1d5db",
  				400: "#9ca3af",
  				500: "#6b7280",
  				600: "#4b5563",
  				700: "#374151",
  				800: "#1f2937",
  				900: "#111827",
  				950: "#030712",
  			},
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
  		},
  		keyframes: {
  			"accordion-down": {
  				from: {
  					height: "0"
  				},
  				to: {
  					height: "var(--radix-accordion-content-height)"
  				}
  			},
  			"accordion-up": {
  				from: {
  					height: "var(--radix-accordion-content-height)"
  				},
  				to: {
  					height: "0"
  				}
  			},
  			"fade-in": {
  				"0%": { opacity: "0", transform: "translateY(10px)" },
  				"100%": { opacity: "1", transform: "translateY(0)" },
  			},
  			"slide-in": {
  				"0%": { transform: "translateX(-100%)" },
  				"100%": { transform: "translateX(0)" },
  			},
  			"pulse-glow": {
  				"0%, 100%": { boxShadow: "0 0 20px rgba(14, 165, 233, 0.3)" },
  				"50%": { boxShadow: "0 0 30px rgba(14, 165, 233, 0.6)" },
  			},
  			shimmer: {
  				"0%": { backgroundPosition: "-200% 0" },
  				"100%": { backgroundPosition: "200% 0" },
  			},
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			"fade-in": "fade-in 0.5s ease-out",
  			"slide-in": "slide-in 0.3s ease-out",
  			"pulse-glow": "pulse-glow 2s ease-in-out infinite",
  			shimmer: "shimmer 1.5s infinite",
  		},
  		backgroundImage: {
  			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
  			"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
  			"gradient-primary": "linear-gradient(135deg, rgb(14 165 233) 0%, rgb(6 182 212) 100%)",
  			"gradient-secondary": "linear-gradient(135deg, rgb(6 182 212) 0%, rgb(8 145 178) 100%)",
  			"gradient-accent": "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
  		},
  		boxShadow: {
  			"glow": "0 0 20px rgba(14, 165, 233, 0.3)",
  			"glow-lg": "0 0 30px rgba(14, 165, 233, 0.5)",
  			"inner-glow": "inset 0 0 20px rgba(14, 165, 233, 0.1)",
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
export default config;
