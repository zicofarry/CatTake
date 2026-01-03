// mobile/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind v4 setup
module.exports = withNativeWind(config, { input: "./global.css" });