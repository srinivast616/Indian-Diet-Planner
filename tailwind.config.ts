import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["system-ui", "sans-serif"],
      },
      colors: {
        saffron: "#0288D1",    // sky blue
        turmeric: "#0277BD",   // medium blue
        cardamom: "#01579B",   // deep blue
        clay: "#1565C0",       // dark blue
        cream: "#E1F5FE",      // light blue tint
        charcoal: "#1A1A1A",   // same
      },
    },
  },
  plugins: [],
};
export default config;
