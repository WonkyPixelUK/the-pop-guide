const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add polyfills for Node.js modules
config.resolver.alias = {
  'crypto': 'react-native-get-random-values',
  'stream': 'stream-browserify',
  'buffer': '@craftzdog/react-native-buffer',
  // Mock the ws module to prevent it from being imported
  'ws': require.resolve('./ws-mock.js'),
};

// Add Node.js core modules resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Web-specific optimizations
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.platforms = ['web', 'native', 'ios', 'android'];
  config.transformer.minifierConfig = {
    // Disable development warnings in production
    keep_fargs: false,
    mangle: {
      keep_fnames: true,
    },
  };
}

module.exports = config; 