import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    sourcemapIgnoreList: (source) => source.includes("bootstrap.min.css.map"),
  },
  build:{
    rollupOptions:{
      external:[/^node:.*/,]
    }
  }
})
