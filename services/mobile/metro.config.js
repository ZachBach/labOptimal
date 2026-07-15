// Default Expo Metro config. Expo's config enables tsconfig `paths` (the `@/*`
// alias) and asset handling out of the box; kept explicit for clarity.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
