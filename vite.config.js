import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localApiPlugin } from './server/devApi.js';

export default defineConfig({
  build: { rollupOptions: { input: { portfolio: 'index.html', portal: 'portal.html' } } },
  plugins: [react(), localApiPlugin()]
});
