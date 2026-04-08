import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Placeholders replaced by scaffold_artifact() at clone time.
// Raw template defaults to "/" and 5173 so local dev still works.
const BASE_PATH = "%%BASE_PATH%%".startsWith("%%") ? "/" : "%%BASE_PATH%%"
const PORT = parseInt("%%PORT%%") || 5173

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: PORT,
    strictPort: true,
  },
})
