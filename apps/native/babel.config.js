module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@domain': '../../packages/domain/src',
          '@adapters': '../../packages/adapters/src',
          '@ui': '../../packages/ui/src',
        },
      },
    ],
  ],
};
