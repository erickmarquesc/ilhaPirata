import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Testes da engine (src/game), sem navegador
  test: {
    environment: 'node',
    include: ['src/game/__tests__/**/*.test.js'],
  },
});
