import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
    coverage: {
      provider: 'istanbul', // Proveedor de cobertura
      reporter: ['text', 'json', 'html'], // Formatos de reporte
      dir: './coverage', // Directorio donde se guardarán los informes
      include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'], // Archivos a incluir en la cobertura
      exclude: ['node_modules/', 'dist/'], // Archivos a excluir de la cobertura
    },
  },
});
