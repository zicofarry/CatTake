module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // Di v4 ini adalah PRESET, bukan plugin
    ],
    plugins: [
      "react-native-reanimated/plugin", // Selalu paling bawah
    ],
  };
};