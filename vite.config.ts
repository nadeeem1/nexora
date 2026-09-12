import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function spaFallbackPreview(): Plugin {
  let cached: string | null = null;
  return {
    name: 'spa-fallback-preview',
    configurePreviewServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.method !== 'GET' || !req.url) return next();
          const path = req.url.split('?')[0];
          if (path.includes('.')) return next();
          if (cached === null) {
            try {
              cached = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf8');
            } catch {
              cached = '';
            }
          }
          if (!cached) return next();
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          res.end(cached);
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallbackPreview()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});