// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // <<< สำคัญ
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
