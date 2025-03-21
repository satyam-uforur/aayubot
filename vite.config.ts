import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Or 'build', depending on your setup
  },
  root: './src', // Make sure this is correctly set to the directory where your main files are.
})



