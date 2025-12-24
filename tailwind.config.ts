import { defineConfig } from "tailwindcss";

export default defineConfig({
  darkMode: "class",
  content: ["./src/renderer/src/**/*.{ts,tsx,js,jsx}", "./src/renderer/index.html"],
  theme: {
    extend: {}
  },
  plugins: []
});
