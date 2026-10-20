import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
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
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        // Premium reference design tokens
        ref: {
          bg: "#F5F9FF",
          sky: "#BCE7FF",
          lightCard: "#DDF3FF",
          primaryText: "#17212F",
          secondaryText: "#788493",
          primaryBlue: "#4A90FF",
          accentCyan: "#70D6F7",
          positiveGreen: "#45C97A",
          warningYellow: "#F5CA46",
          negativeRed: "#EF6B6B",
          accentPurple: "#A18CFF",
        },
        // Fintech domain colors
        fintech: {
          needs: "#2563eb",
          wants: "#d97706", // warm accent instead of default purple
          savings: "#059669",
          bills: "#d97706",
          overdue: "#dc2626",
          ai: "#22c55e",
          income: "#16a34a",
        },
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "ref-gradient": "linear-gradient(180deg, #B9E5FF 0%, #ECF6FF 48%, #FFFFFF 100%)", // taste-skill-ignore
        "ai-rainbow":
          "conic-gradient(from 180deg, #FF512F, #DD2476, #8E2DE2, #4A90FF, #00C9FF, #43E97B, #F9D423, #FF512F)", // taste-skill-ignore
      },
    },
  },
  plugins: [],
};
export default config;
