const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    extraNodeModules: {
      '@sunscore/domain': path.resolve(monorepoRoot, 'packages/domain'),
      '@sunscore/adapters': path.resolve(monorepoRoot, 'packages/adapters'),
      '@sunscore/ui': path.resolve(monorepoRoot, 'packages/ui'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
