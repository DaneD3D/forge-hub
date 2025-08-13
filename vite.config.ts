import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss()],
  server: {
    port: 3000,
    https: {
      key: './certs/key.pem',
      cert: './certs/cert.pem',
    },
  },
  build: {
    target: 'esnext',
  },
});
