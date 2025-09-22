/**
 * Purpose: Tailwind CSS configuration controlling content scanning and theme extensions for the project.
 * Editing: Add paths or custom theme tokens here; run the build to ensure new classes are picked up.
 * Dependencies: Used by Tailwind CLI (via Vite) alongside postcss.config.js.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}