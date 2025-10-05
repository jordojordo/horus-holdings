// PostCSS configuration enabling support for CSS custom properties used by
// Kongponents. Without this plugin Vite may attempt to transform custom
// properties away, which prevents theming from working correctly.
export default {
  plugins: {
    'postcss-custom-properties': {
      preserve: true,
    },
  },
}
