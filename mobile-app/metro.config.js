const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure the resolver works properly
config.resolver.assetExts.push('bin');

module.exports = config; 