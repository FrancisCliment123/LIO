import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
      },
      optimizeDeps: {
        exclude: [
          'react-native',
          'expo',
          'expo-status-bar',
          'expo-dev-client',
          '@expo/metro-runtime',
          'expo-asset',
          'expo-constants',
          'expo-file-system',
          'expo-font',
        ],
      },
      ssr: {
        external: [
          'react-native',
          'expo',
          'expo-status-bar',
          'expo-dev-client',
        ],
      },
    };
});
