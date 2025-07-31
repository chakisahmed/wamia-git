// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');   // ← note 'expo/metro-config', not '@expo/metro-config'

const config = getDefaultConfig(__dirname);

// 1. Add your extra source extension:
config.resolver.sourceExts.push('cjs');

// 2. Make sure we include Expo's asset-plugin so assets get hashed into the production bundle:
config.transformer.assetPlugins = [
  // preserve any existing plugins
  ...(config.transformer.assetPlugins || []),
  'expo-asset/tools/hashAssetFiles'
];

module.exports = config;
