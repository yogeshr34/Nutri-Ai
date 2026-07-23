/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ember: "#ff5406",
        verdant: "#00b33f",
        signal: "#ff3400",
        sky: "#00a9dd",
        mist: "#72a2c5",
        plum: "#bd4be5",
        graphite: "#2f2f2f",
        charcoal: "#000000",
        fog: "#f5f5f5",
        paper: "#ffffff",
      },
      fontFamily: {
        display: ["'DM Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        brand: "26px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};
