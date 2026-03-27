import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror-core': [
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/commands',
            '@codemirror/language',
          ],
          'codemirror-langs': [
            '@codemirror/lang-json',
            '@codemirror/lang-markdown',
          ],
          'codemirror-extras': [
            '@codemirror/autocomplete',
            '@codemirror/lint',
          ],
          'markdown': ['marked', 'marked-highlight', 'highlight.js', 'dompurify'],
          'parsers': ['js-yaml', 'smol-toml'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'codemirror',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/commands',
      '@codemirror/language',
      '@codemirror/lang-json',
      '@codemirror/lang-markdown',
      '@codemirror/autocomplete',
      '@codemirror/lint',
    ],
    exclude: ['@codemirror/legacy-modes'],
  },
})
