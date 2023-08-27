import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'chunks/[name].js',
        entryFileNames: 'entries/[name].js',
      },
    },
    sourcemap: true,
    target: 'ESNext',
    minify: false,
  },
  plugins: [svelte()],
  server: {
    proxy: {
      '/jira': {
        target: 'http://localhost:2990/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jira/, '/jira/'),
        secure: false,
        ws: true,
      }
    }
  }
})
