import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

// Get absolute path to react-native-web
const reactNativeWeb = path.resolve(__dirname, '../../node_modules/react-native-web');

export default defineConfig({
  plugins: [react(), ...(process.env.NODE_ENV !== 'production' ? [basicSsl()] : [])],
  resolve: {
    alias: [
      { find: 'react-native', replacement: reactNativeWeb },
      { find: '@domain', replacement: path.resolve(__dirname, '../../packages/domain/src') },
      { find: '@adapters', replacement: path.resolve(__dirname, '../../packages/adapters/src') },
      { find: '@ui', replacement: path.resolve(__dirname, '../../packages/ui/src') }
    ],
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js']
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
      loader: {
        '.js': 'jsx'
      }
    }
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  server: { host: '0.0.0.0' }
});
