import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.js'),
      },
      output: {
        entryFileNames: chunk => {
          // Rinomina background per evitare sotto-cartelle
          if (chunk.name === 'src/background') return 'background.js'
          return '[name].js'
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public', // per includere manifest.json, icone, ecc.
})
