import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "#d9e2ec",
        surface: "#f7fafc",
        ink: "#102a43",
        muted: "#627d98",
        brand: {
          50: "#e6f6ff",
          100: "#bae3ff",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
