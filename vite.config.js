import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/Warframe-Main-Void/',
  server: {
    proxy: {
      '/api/warframe': {
        target: 'https://api.warframestat.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/warframe/, ''),
      },
    },
  },
  build: {
    outDir: 'docs',
    assetsDir: '',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].chunk.js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
})
