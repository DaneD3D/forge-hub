import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss(), basicSsl()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    https: {
      key: './certs/key.pem',
      cert: './certs/cert.pem',
    },
  },
  build: {
    target: 'esnext',
  },
});
