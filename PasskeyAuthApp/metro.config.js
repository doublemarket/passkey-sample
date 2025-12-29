const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const sharedConfigPath = path.resolve(__dirname, '..', 'config');
const config = {
  watchFolders: [sharedConfigPath],
  resolver: {
    extraNodeModules: {
      config: sharedConfigPath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
