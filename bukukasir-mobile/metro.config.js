const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

const shims = {
  'react-native-reanimated': path.resolve(__dirname, 'shared/shims/react-native-reanimated.tsx'),
  '@react-native-async-storage/async-storage': path.resolve(__dirname, 'shared/shims/async-storage.ts'),
  'expo-haptics': path.resolve(__dirname, 'shared/shims/expo-haptics.ts'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (shims[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: shims[moduleName],
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
