/** @type {import('tailwindcss').Config} */
module.exports = {
  // Pastikan ini mencakup semua file di folder app dan components
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};