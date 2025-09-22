/**
 * Purpose: PostCSS plugin chain used by Vite to process Tailwind and vendor prefixing.
 * Editing: Add plugins (e.g., nesting) here and run the build to confirm output.
 * Dependencies: Consumed automatically by Vite alongside tailwind.config.js.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}