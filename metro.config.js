const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The firebase JS SDK's package.json "exports" field resolves to a build
// that Metro's default resolver can't load in React Native — this is the
// documented workaround (Firebase + Expo/Metro).
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
