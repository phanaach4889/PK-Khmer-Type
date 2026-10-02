import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'documents-endpoint-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = (req.url || '').split('?')[0];
          if (url === '/Documents' || url === '/documents') {
            res.writeHead(301, { Location: '/Documents/' });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ]
});
