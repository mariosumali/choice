import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Resolve the local Capacitor plugin from source so CI works without
      // a prior `tsc` in plugins/system-volume (dist/ is gitignored).
      'system-volume': path.resolve(
        __dirname,
        'plugins/system-volume/src/index.ts',
      ),
    },
  },
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
