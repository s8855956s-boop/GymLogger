const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure wasm is treated as an asset so the web worker can load wa-sqlite.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'wasm');

module.exports = config;
